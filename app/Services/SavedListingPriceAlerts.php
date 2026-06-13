<?php

namespace App\Services;

use App\Mail\PriceDropMail;
use App\Models\SavedListing;
use App\Models\VehicleListing;
use Illuminate\Support\Facades\Mail;

class SavedListingPriceAlerts
{
    public function notifyIfPriceDropped(VehicleListing $listing, int $previousPrice): void
    {
        if ($previousPrice <= $listing->asking_price) {
            return;
        }

        SavedListing::query()
            ->where('vehicle_listing_id', $listing->id)
            ->where('price_alerts_enabled', true)
            ->with('user')
            ->get()
            ->each(function (SavedListing $saved) use ($listing, $previousPrice): void {
                $email = $saved->user?->email;

                if (! $email) {
                    return;
                }

                Mail::to($email)->queue(new PriceDropMail(
                    $listing,
                    $previousPrice,
                    $listing->asking_price,
                ));

                $saved->update(['saved_price' => $listing->asking_price]);
            });
    }
}
