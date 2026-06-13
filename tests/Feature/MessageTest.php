<?php

use App\Events\MessageSent;
use App\Events\UnreadCountUpdated;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\VehicleListing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('authenticated users can view messages index', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('messages.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('messages/index'));
});

test('guests cannot access messages', function () {
    $this->get(route('messages.index'))->assertRedirect(route('login'));
});

test('users can start a conversation from a listing', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create(['user_id' => $seller->id]);

    $response = $this->actingAs($buyer)->post(route('messages.store'), [
        'recipient_id' => $seller->id,
        'vehicle_listing_id' => $listing->id,
        'body' => 'Is this still available?',
    ]);

    $conversation = Conversation::query()->first();

    expect($conversation)->not->toBeNull();
    expect($conversation->vehicle_listing_id)->toBe($listing->id);
    expect(Message::query()->count())->toBe(1);

    $response->assertRedirect(route('messages.show', $conversation));
});

test('users cannot message themselves', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('messages.store'), [
            'recipient_id' => $user->id,
            'body' => 'Hello',
        ])
        ->assertStatus(422);
});

test('users can send and read messages in a conversation', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();

    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $seller->id,
        'body' => 'Hello buyer',
    ]);

    $response = $this->actingAs($buyer)->get(route('messages.show', $conversation));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('messages/show')
        ->has('messages', 1)
        ->where('messages.0.body', 'Hello buyer')
    );

    expect(
        Message::query()
            ->where('conversation_id', $conversation->id)
            ->whereNull('read_at')
            ->count(),
    )->toBe(0);
});

test('unread count endpoint returns unread messages for the current user', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $seller->id,
        'body' => 'Unread message',
    ]);

    $this->actingAs($buyer)
        ->getJson(route('messages.unread-count'))
        ->assertOk()
        ->assertJson(['count' => 1]);
});

test('poll endpoint returns new messages after a given id', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $first = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $seller->id,
        'body' => 'First',
    ]);

    Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $seller->id,
        'body' => 'Second',
    ]);

    $this->actingAs($buyer)
        ->getJson(route('messages.poll', ['conversation' => $conversation, 'after_id' => $first->id]))
        ->assertOk()
        ->assertJsonPath('messages.0.body', 'Second');
});

test('sending a message broadcasts realtime events when pusher is enabled', function () {
    config([
        'broadcasting.default' => 'pusher',
        'broadcasting.connections.pusher.key' => 'test-key',
    ]);

    Event::fake([MessageSent::class, UnreadCountUpdated::class]);

    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $this->actingAs($buyer)
        ->post(route('messages.messages.store', $conversation), [
            'body' => 'Real-time hello',
        ])
        ->assertRedirect();

    Event::assertDispatched(MessageSent::class);
    Event::assertDispatched(UnreadCountUpdated::class);
});

test('users cannot access conversations they are not part of', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($other->id, User::factory()->create()->id);

    $this->actingAs($user)
        ->get(route('messages.show', $conversation))
        ->assertForbidden();
});

test('listing message url shows compose page for new conversations', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create(['user_id' => $seller->id]);

    $response = $this->actingAs($buyer)->get(route('listings.message', $listing));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('listings/message')
        ->where('listing.id', $listing->id)
        ->has('defaultMessage')
    );
});

test('listing message url redirects to existing conversation', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create(['user_id' => $seller->id]);
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id, $listing->id);

    $this->actingAs($buyer)
        ->get(route('listings.message', $listing))
        ->assertRedirect(route('messages.show', $conversation));
});

test('users can delete a conversation from their inbox', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $seller->id,
        'body' => 'Hello',
    ]);

    $this->actingAs($buyer)
        ->delete(route('messages.destroy', $conversation))
        ->assertRedirect(route('messages.index'));

    expect($conversation->fresh())->toBeNull();
    expect(Message::query()->count())->toBe(0);

    $this->actingAs($buyer)
        ->get(route('messages.index'))
        ->assertInertia(fn ($page) => $page->has('conversations', 0));
});

test('users can delete their own messages', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $buyer->id,
        'body' => 'My message',
    ]);

    $this->actingAs($buyer)
        ->delete(route('messages.messages.destroy', [$conversation, $message]))
        ->assertRedirect();

    expect(Message::query()->find($message->id))->toBeNull();
});

test('deleting the last message removes the conversation', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $buyer->id,
        'body' => 'Only message',
    ]);

    $this->actingAs($buyer)
        ->delete(route('messages.messages.destroy', [$conversation, $message]))
        ->assertRedirect(route('messages.index'));

    expect(Conversation::query()->find($conversation->id))->toBeNull();
    expect(Message::query()->count())->toBe(0);
});

test('users cannot delete another users message', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $seller->id,
        'body' => 'Seller message',
    ]);

    $this->actingAs($buyer)
        ->delete(route('messages.messages.destroy', [$conversation, $message]))
        ->assertForbidden();
});

test('users can edit their own text messages', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $message = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $buyer->id,
        'body' => 'Original text',
    ]);

    $this->actingAs($buyer)
        ->patch(route('messages.messages.update', [$conversation, $message]), [
            'body' => 'Updated text https://example.com',
        ])
        ->assertRedirect();

    $message->refresh();

    expect($message->body)->toBe('Updated text https://example.com');
    expect($message->edited_at)->not->toBeNull();
});

test('users can send image attachments', function () {
    Storage::fake('public');

    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $this->actingAs($buyer)
        ->post(route('messages.messages.store', $conversation), [
            'body' => 'Check this out',
            'attachment' => UploadedFile::fake()->image('photo.jpg'),
        ])
        ->assertRedirect();

    $message = Message::query()->first();

    expect($message->attachment_type)->toBe('image');
    expect($message->attachment_path)->not->toBeNull();
    Storage::disk('public')->assertExists($message->attachment_path);
});

test('users can send voice attachments with video webm mime', function () {
    Storage::fake('public');

    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $this->actingAs($buyer)
        ->post(route('messages.messages.store', $conversation), [
            'attachment' => UploadedFile::fake()->create('voice.webm', 100, 'video/webm'),
        ])
        ->assertRedirect();

    $message = Message::query()->first();

    expect($message->attachment_type)->toBe('voice');
    expect($message->body)->toBe('Voice message');
});

test('users can reply to a specific message', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $conversation = Conversation::findOrCreateBetween($buyer->id, $seller->id);

    $original = Message::query()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $seller->id,
        'body' => 'Is it still available?',
    ]);

    $this->actingAs($buyer)
        ->post(route('messages.messages.store', $conversation), [
            'body' => 'Yes, when can you see it?',
            'reply_to_message_id' => $original->id,
        ])
        ->assertRedirect();

    $reply = Message::query()->where('sender_id', $buyer->id)->first();

    expect($reply)->not->toBeNull();
    expect($reply->reply_to_message_id)->toBe($original->id);

    $this->actingAs($buyer)
        ->get(route('messages.show', $conversation))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 2)
            ->where('messages.1.reply_to.id', $original->id)
            ->where('messages.1.reply_to.body', 'Is it still available?')
        );
});
