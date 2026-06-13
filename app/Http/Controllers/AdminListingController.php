<?php

namespace App\Http\Controllers;

use App\Enums\ListingApprovalMode;
use App\Enums\ListingStatus;
use App\Http\Requests\UpdateMarketSettingsRequest;
use App\Http\Resources\VehicleListingResource;
use App\Mail\ListingApprovedMail;
use App\Models\VehicleListing;
use App\Services\MarketSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AdminListingController extends Controller
{
    public function index(Request $request): Response
    {
        $listings = VehicleListing::query()
            ->with(['user', 'images'])
            ->latest()
            ->get()
            ->map(function (VehicleListing $listing) {
                return [
                    ...VehicleListingResource::make($listing),
                    'seller_name' => $listing->user->name,
                ];
            });

        return Inertia::render('admin/listings/index', [
            'listings' => $listings,
            'approvalMode' => app(MarketSettings::class)->approvalMode()->value,
        ]);
    }

    public function approve(VehicleListing $listing): RedirectResponse
    {
        $listing->update(['status' => ListingStatus::Approved]);

        $listing->load('user');

        if ($listing->user?->email) {
            Mail::to($listing->user->email)->queue(new ListingApprovedMail($listing));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Listing approved and is now live.')]);

        return back();
    }

    public function reject(VehicleListing $listing): RedirectResponse
    {
        $listing->update(['status' => ListingStatus::Rejected]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Listing rejected.')]);

        return back();
    }

    public function updateSettings(UpdateMarketSettingsRequest $request, MarketSettings $marketSettings): RedirectResponse
    {
        $marketSettings->setApprovalMode($request->enum('listing_approval_mode', ListingApprovalMode::class));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Market settings updated.')]);

        return back();
    }
}
