<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function (User $user, string $conversationId): bool {
    $conversation = Conversation::query()->find($conversationId);

    return $conversation !== null && $conversation->includesUser($user->id);
});

Broadcast::channel('user.{userId}', function (User $user, string $userId): bool {
    return $user->id === $userId;
});
