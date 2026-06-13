<?php

namespace App\Mail;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewMessageMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Message $message,
        public Conversation $conversation,
        public User $recipient,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New message on Web2Autos',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.new-message',
            with: [
                'senderName' => $this->message->sender?->name ?? 'Someone',
                'preview' => $this->message->previewText(),
                'conversationUrl' => route('messages.show', $this->conversation),
            ],
        );
    }
}
