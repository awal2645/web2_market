<?php

namespace App\Mail;

use App\Models\VehicleListing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PriceDropMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public VehicleListing $listing,
        public int $previousPrice,
        public int $newPrice,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Price drop on a saved listing',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.price-drop',
            with: [
                'listingTitle' => $this->listing->title(),
                'listingUrl' => route('listings.show', $this->listing),
                'previousPrice' => number_format($this->previousPrice),
                'newPrice' => number_format($this->newPrice),
            ],
        );
    }
}
