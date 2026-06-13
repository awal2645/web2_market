<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingReportRequest;
use App\Models\ListingReport;
use App\Models\VehicleListing;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ListingReportController extends Controller
{
    public function store(StoreListingReportRequest $request, VehicleListing $listing): RedirectResponse
    {
        ListingReport::query()->create([
            'vehicle_listing_id' => $listing->id,
            'user_id' => $request->user()?->id,
            'reason' => $request->string('reason')->toString(),
            'details' => $request->string('details')->toString() ?: null,
            'status' => 'open',
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Thank you. Your report has been submitted for review.',
        ]);

        return back();
    }
}
