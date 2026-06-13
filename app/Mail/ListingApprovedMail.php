<?php

namespace App\Mail;

use App\Models\VehicleListing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ListingApprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public VehicleListing $listing) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your listing is live on Web2Autos',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.listing-approved',
            with: [
                'listingTitle' => $this->listing->title(),
                'listingUrl' => route('listings.show', $this->listing),
            ],
        );
    }
}
