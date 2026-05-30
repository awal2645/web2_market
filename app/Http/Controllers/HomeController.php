<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Http\Resources\VehicleListingResource;
use App\Models\VehicleListing;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $listings = VehicleListing::query()
            ->where('status', ListingStatus::Approved)
            ->with('images')
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (VehicleListing $listing) => VehicleListingResource::make($listing));

        return Inertia::render('welcome', [
            'listings' => $listings,
            'filterOptions' => BrowseController::filterOptions(),
        ]);
    }
}
