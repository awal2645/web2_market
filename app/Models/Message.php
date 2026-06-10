<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable([
    'conversation_id',
    'sender_id',
    'reply_to_message_id',
    'body',
    'attachment_type',
    'attachment_path',
    'read_at',
    'edited_at',
])]
class Message extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'edited_at' => 'datetime',
        ];
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function hasAttachment(): bool
    {
        return $this->attachment_path !== null;
    }

    public function isImage(): bool
    {
        return $this->attachment_type === 'image';
    }

    public function isVoice(): bool
    {
        return $this->attachment_type === 'voice';
    }

    public function attachmentUrl(): ?string
    {
        if (! $this->attachment_path) {
            return null;
        }

        return Storage::disk('public')->url($this->attachment_path);
    }

    public function deleteAttachmentFile(): void
    {
        if ($this->attachment_path) {
            Storage::disk('public')->delete($this->attachment_path);
        }
    }

    public function previewText(): string
    {
        if ($this->isImage()) {
            return 'Photo';
        }

        if ($this->isVoice()) {
            return 'Voice message';
        }

        return Str::limit(trim($this->body), 140);
    }

    /**
     * @return BelongsTo<Message, $this>
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_message_id');
    }

    /**
     * @return BelongsTo<Conversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
