<?php

namespace App\Http\Resources;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;

class ConversationResource
{
    /**
     * @return array<string, mixed>
     */
    public static function make(Conversation $conversation, User $currentUser): array
    {
        $conversation->loadMissing([
            'participantOne',
            'participantTwo',
            'vehicleListing',
            'messages' => fn ($query) => $query->latest()->limit(1),
        ]);

        $otherUserId = $conversation->otherParticipantId($currentUser->id);
        $otherUser = $otherUserId === $conversation->participant_one_id
            ? $conversation->participantOne
            : $conversation->participantTwo;

        $latestMessage = $conversation->messages->first();

        $unreadCount = Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $currentUser->id)
            ->whereNull('read_at')
            ->count();

        return [
            'id' => $conversation->id,
            'other_user' => UserResource::make($otherUser),
            'listing' => $conversation->vehicleListing ? [
                'id' => $conversation->vehicleListing->id,
                'title' => $conversation->vehicleListing->title(),
            ] : null,
            'last_message' => $latestMessage ? MessageResource::make($latestMessage) : null,
            'unread_count' => $unreadCount,
            'last_message_at' => $conversation->last_message_at?->toISOString(),
            'updated_at' => $conversation->updated_at?->toISOString(),
        ];
    }
}
