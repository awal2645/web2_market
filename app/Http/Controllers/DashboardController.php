<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Http\Resources\VehicleListingResource;
use App\Models\VehicleListing;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $allListings = VehicleListing::query()
            ->where('user_id', $user->id)
            ->with('images')
            ->latest()
            ->get();

        $recentListings = $allListings->take(5)->map(
            fn (VehicleListing $listing) => VehicleListingResource::make($listing),
        );

        $approvedCount = $allListings->where('status', ListingStatus::Approved)->count();
        $pendingCount = $allListings->where('status', ListingStatus::Pending)->count();
        $rejectedCount = $allListings->where('status', ListingStatus::Rejected)->count();

        $recentActivity = $allListings->take(6)->map(function (VehicleListing $listing) {
            $message = match ($listing->status) {
                ListingStatus::Approved => "Your {$listing->title()} is live on the marketplace.",
                ListingStatus::Pending => "Your {$listing->title()} is pending admin review.",
                ListingStatus::Rejected => "Your {$listing->title()} was not approved.",
            };

            return [
                'id' => $listing->id,
                'message' => $message,
                'time' => $listing->created_at?->diffForHumans() ?? '',
                'type' => match ($listing->status) {
                    ListingStatus::Approved => 'live',
                    ListingStatus::Pending => 'pending',
                    ListingStatus::Rejected => 'rejected',
                },
            ];
        })->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $allListings->count(),
                'approved' => $approvedCount,
                'pending' => $pendingCount,
                'rejected' => $rejectedCount,
            ],
            'recentListings' => $recentListings,
            'recentActivity' => $recentActivity,
            'emailVerified' => $user->hasVerifiedEmail(),
        ]);
    }
}
