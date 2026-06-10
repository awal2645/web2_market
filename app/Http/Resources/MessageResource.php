<?php

namespace App\Http\Resources;

use App\Models\Message;

class MessageResource
{
    /**
     * @return array<string, mixed>
     */
    public static function make(Message $message): array
    {
        $message->loadMissing(['sender', 'replyTo.sender']);

        return [
            'id' => $message->id,
            'body' => $message->body,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender?->name,
            'is_mine' => false,
            'attachment_type' => $message->attachment_type,
            'attachment_url' => $message->attachmentUrl(),
            'reply_to' => $message->replyTo
                ? self::replyPreview($message->replyTo)
                : null,
            'read_at' => $message->read_at?->toISOString(),
            'edited_at' => $message->edited_at?->toISOString(),
            'created_at' => $message->created_at?->toISOString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function makeForUser(Message $message, string $currentUserId): array
    {
        $data = self::make($message);
        $data['is_mine'] = $message->sender_id === $currentUserId;

        if ($data['reply_to']) {
            $data['reply_to']['is_mine'] = $message->replyTo?->sender_id === $currentUserId;
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    public static function replyPreview(Message $message): array
    {
        $message->loadMissing('sender');

        return [
            'id' => $message->id,
            'body' => $message->previewText(),
            'sender_name' => $message->sender?->name ?? 'Unknown',
            'attachment_type' => $message->attachment_type,
            'is_mine' => false,
        ];
    }
}
