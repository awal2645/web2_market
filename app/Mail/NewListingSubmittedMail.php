<?php

namespace App\Mail;

use App\Models\VehicleListing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewListingSubmittedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public VehicleListing $listing) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New listing submitted: '.$this->listing->title(),
        );
    }

    public function content(): Content
    {
        $this->listing->loadMissing('user');

        return new Content(
            markdown: 'mail.new-listing-submitted',
            with: [
                'listingTitle' => $this->listing->title(),
                'status' => $this->listing->status->value,
                'askingPrice' => number_format((float) $this->listing->asking_price, 0),
                'location' => trim(implode(', ', array_filter([
                    $this->listing->city,
                    $this->listing->state,
                ]))),
                'sellerName' => $this->listing->user?->name
                    ?? $this->listing->contact_name
                    ?? 'Unknown seller',
                'sellerEmail' => $this->listing->user?->email
                    ?? $this->listing->contact_email
                    ?? null,
                'adminUrl' => route('admin.listings.index'),
                'listingUrl' => $this->listing->isPubliclyViewable()
                    ? route('listings.show', $this->listing)
                    : null,
            ],
        );
    }
}
