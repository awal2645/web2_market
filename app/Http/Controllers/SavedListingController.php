<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Http\Resources\VehicleListingResource;
use App\Models\SavedListing;
use App\Models\VehicleListing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavedListingController extends Controller
{
    public function index(Request $request): Response
    {
        $listings = SavedListing::query()
            ->where('user_id', $request->user()->id)
            ->whereHas('vehicleListing')
            ->with(['vehicleListing.images'])
            ->latest()
            ->get()
            ->map(function (SavedListing $saved) {
                $listing = $saved->vehicleListing;

                if (! $listing) {
                    return null;
                }

                return array_merge(VehicleListingResource::make($listing, true), [
                    'saved_price' => $saved->saved_price,
                    'price_alerts_enabled' => $saved->price_alerts_enabled,
                ]);
            })
            ->filter()
            ->values()
            ->all();

        return Inertia::render('saved/index', [
            'listings' => $listings,
        ]);
    }

    public function store(Request $request, VehicleListing $listing): RedirectResponse
    {
        abort_unless($listing->status === ListingStatus::Approved, 404);

        SavedListing::query()->firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'vehicle_listing_id' => $listing->id,
            ],
            [
                'saved_price' => $listing->asking_price,
                'price_alerts_enabled' => true,
            ],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Listing saved to your watchlist.',
        ]);

        return back();
    }

    public function destroy(Request $request, VehicleListing $listing): RedirectResponse
    {
        SavedListing::query()
            ->where('user_id', $request->user()->id)
            ->where('vehicle_listing_id', $listing->id)
            ->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Listing removed from your watchlist.',
        ]);

        return back();
    }

    public function updateAlerts(Request $request, VehicleListing $listing): RedirectResponse
    {
        $validated = $request->validate([
            'price_alerts_enabled' => ['required', 'boolean'],
        ]);

        SavedListing::query()
            ->where('user_id', $request->user()->id)
            ->where('vehicle_listing_id', $listing->id)
            ->update(['price_alerts_enabled' => $validated['price_alerts_enabled']]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $validated['price_alerts_enabled']
                ? 'Price drop alerts enabled.'
                : 'Price drop alerts disabled.',
        ]);

        return back();
    }
}
