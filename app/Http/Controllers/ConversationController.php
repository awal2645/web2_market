<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Http\Resources\VehicleListingResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\VehicleListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->where(function ($query) use ($user): void {
                $query->where('participant_one_id', $user->id)
                    ->orWhere('participant_two_id', $user->id);
            })
            ->with(['participantOne', 'participantTwo', 'vehicleListing'])
            ->with(['messages' => fn ($query) => $query->latest()->limit(1)])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Conversation $conversation) => ConversationResource::make($conversation, $user));

        return Inertia::render('messages/index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $request->user();

        abort_unless($conversation->includesUser($user->id), 403);

        $conversation->load(['participantOne', 'participantTwo', 'vehicleListing']);

        Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()
            ->with(['sender', 'replyTo.sender'])
            ->orderBy('created_at')
            ->get()
            ->map(fn (Message $message) => MessageResource::makeForUser($message, $user->id));

        return Inertia::render('messages/show', [
            'conversation' => ConversationResource::make($conversation, $user),
            'messages' => $messages,
        ]);
    }

    public function store(StoreMessageRequest $request): RedirectResponse
    {
        $user = $request->user();
        $recipientId = $request->string('recipient_id')->toString();

        abort_if($recipientId === $user->id, 422, 'You cannot message yourself.');

        $listingId = $request->integer('vehicle_listing_id') ?: null;

        if ($listingId) {
            $listing = VehicleListing::query()->findOrFail($listingId);
            abort_unless($listing->user_id === $recipientId, 422, 'Invalid recipient for this listing.');
        }

        $conversation = Conversation::findOrCreateBetween(
            $user->id,
            $recipientId,
            $listingId,
        );

        $this->createMessageFromRequest($conversation, $user->id, $request);

        return redirect()->route('messages.show', $conversation);
    }

    public function composeFromListing(Request $request, VehicleListing $listing): Response|RedirectResponse
    {
        $user = $request->user();

        abort_unless($listing->isApproved(), 404);
        abort_if($listing->user_id === $user->id, 403);

        $listing->load('images');

        $conversation = Conversation::findBetween(
            $user->id,
            $listing->user_id,
            $listing->id,
        );

        if ($conversation) {
            return redirect()->route('messages.show', $conversation);
        }

        return Inertia::render('listings/message', [
            'listing' => VehicleListingResource::make($listing),
            'defaultMessage' => "Hi, I'm interested in your {$listing->title()}.",
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => $request->user()->unreadMessagesCount(),
        ]);
    }

    public function poll(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        abort_unless($conversation->includesUser($user->id), 403);

        $afterId = $request->integer('after_id');

        Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $query = $conversation->messages()
            ->with(['sender', 'replyTo.sender'])
            ->orderBy('created_at');

        if ($afterId > 0) {
            $query->where('id', '>', $afterId);
        }

        $messages = $query->get()
            ->map(fn (Message $message) => MessageResource::makeForUser($message, $user->id));

        return response()->json([
            'messages' => $messages,
            'unread_count' => $user->fresh()->unreadMessagesCount(),
        ]);
    }

    public function sendMessage(StoreMessageRequest $request, Conversation $conversation): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        abort_unless($conversation->includesUser($user->id), 403);

        $message = $this->createMessageFromRequest(
            $conversation,
            $user->id,
            $request,
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => MessageResource::makeForUser($message, $user->id),
            ]);
        }

        return back();
    }

    public function updateMessage(UpdateMessageRequest $request, Conversation $conversation, Message $message): RedirectResponse
    {
        $user = $request->user();

        abort_unless($conversation->includesUser($user->id), 403);
        abort_unless($message->conversation_id === $conversation->id, 404);
        abort_unless($message->sender_id === $user->id, 403);
        abort_if($message->isVoice(), 422, 'Voice messages cannot be edited.');

        $message->update([
            'body' => $request->string('body')->toString(),
            'edited_at' => now(),
        ]);

        return back();
    }

    public function destroy(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();

        abort_unless($conversation->includesUser($user->id), 403);

        $conversation->load('messages');
        $conversation->messages->each(fn (Message $item) => $item->deleteAttachmentFile());

        $conversation->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Conversation permanently deleted.',
        ]);

        return redirect()->route('messages.index');
    }

    public function destroyMessage(Request $request, Conversation $conversation, Message $message): RedirectResponse
    {
        $user = $request->user();

        abort_unless($conversation->includesUser($user->id), 403);
        abort_unless($message->conversation_id === $conversation->id, 404);
        abort_unless($message->sender_id === $user->id, 403);

        $message->deleteAttachmentFile();
        $message->delete();

        $latestMessage = $conversation->messages()->latest()->first();
        $conversation->update([
            'last_message_at' => $latestMessage?->created_at,
        ]);

        if (! $latestMessage) {
            $conversation->delete();

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Conversation permanently deleted.',
            ]);

            return redirect()->route('messages.index');
        }

        return back();
    }

    private function createMessageFromRequest(
        Conversation $conversation,
        string $senderId,
        StoreMessageRequest $request,
    ): Message {
        $body = trim($request->string('body')->toString());
        $attachmentType = null;
        $attachmentPath = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $mime = (string) $file->getMimeType();
            $extension = strtolower((string) $file->getClientOriginalExtension());

            $attachmentType = str_starts_with($mime, 'image/')
                || in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)
                ? 'image'
                : 'voice';
            $attachmentPath = $file->store('messages', 'public');

            if ($body === '' && $attachmentType === 'voice') {
                $body = 'Voice message';
            }
        }

        if ($body === '') {
            $body = $attachmentType === 'image' ? 'Photo' : '';
        }

        $replyToId = $request->integer('reply_to_message_id') ?: null;

        if ($replyToId) {
            $replyTo = Message::query()->find($replyToId);

            abort_unless(
                $replyTo && $replyTo->conversation_id === $conversation->id,
                422,
                'Invalid reply target.',
            );
        }

        $message = $conversation->messages()->create([
            'sender_id' => $senderId,
            'reply_to_message_id' => $replyToId,
            'body' => $body,
            'attachment_type' => $attachmentType,
            'attachment_path' => $attachmentPath,
        ]);

        $conversation->update(['last_message_at' => $message->created_at]);

        return $message->load(['sender', 'replyTo.sender']);
    }
}
