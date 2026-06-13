<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Http\Requests\StoreSellerReviewRequest;
use App\Http\Resources\SellerProfileResource;
use App\Http\Resources\SellerReviewResource;
use App\Http\Resources\VehicleListingResource;
use App\Models\SellerReview;
use App\Models\User;
use App\Models\VehicleListing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SellerProfileController extends Controller
{
    public function show(Request $request, User $seller): Response|RedirectResponse
    {
        $routeKey = (string) $request->route()->originalParameter('seller');

        if ($seller->slug && $routeKey !== $seller->slug) {
            return redirect()->route('sellers.show', $seller, 301);
        }

        $user = $request->user();

        $search = $request->string('q')->toString();
        $tab = $request->string('tab', 'listings')->toString();
        $tab = in_array($tab, ['listings', 'reviews'], true) ? $tab : 'listings';

        $listingsQuery = VehicleListing::query()
            ->where('user_id', $seller->id)
            ->where('status', ListingStatus::Approved)
            ->with('images');

        if ($search !== '') {
            $like = '%'.$search.'%';
            $listingsQuery->where(function ($query) use ($like): void {
                $query->where('make', 'like', $like)
                    ->orWhere('model', 'like', $like)
                    ->orWhere('trim', 'like', $like)
                    ->orWhere('year', 'like', $like);
            });
        }

        $totalListings = VehicleListing::query()
            ->where('user_id', $seller->id)
            ->where('status', ListingStatus::Approved)
            ->count();

        $listings = $listingsQuery
            ->latest()
            ->paginate(9)
            ->appends([
                'tab' => 'listings',
                ...($search !== '' ? ['q' => $search] : []),
            ])
            ->withQueryString()
            ->through(fn (VehicleListing $listing) => VehicleListingResource::make($listing));

        $reviews = SellerReview::query()
            ->where('seller_id', $seller->id)
            ->with(['reviewer', 'vehicleListing'])
            ->latest()
            ->paginate(10, ['*'], 'reviews_page')
            ->appends(['tab' => 'reviews'])
            ->withQueryString()
            ->through(fn (SellerReview $review) => SellerReviewResource::make($review));

        $ratingStats = $this->ratingStats($seller);

        $contactListing = VehicleListing::query()
            ->where('user_id', $seller->id)
            ->where('status', ListingStatus::Approved)
            ->latest()
            ->first();

        $messageListing = VehicleListing::query()
            ->where('user_id', $seller->id)
            ->where('status', ListingStatus::Approved)
            ->latest()
            ->first(['id', 'slug']);

        $canReview = false;
        $hasReviewed = false;

        if ($user && $user->id !== $seller->id) {
            $hasReviewed = SellerReview::query()
                ->where('seller_id', $seller->id)
                ->where('reviewer_id', $user->id)
                ->exists();

            $canReview = ! $hasReviewed && $seller->hasConversationWith($user->id);
        }

        return Inertia::render('sellers/show', [
            'seller' => SellerProfileResource::make(
                $seller,
                $ratingStats['average'],
                $ratingStats['count'],
                $ratingStats['distribution'],
                $totalListings,
                $contactListing,
            ),
            'listings' => $listings,
            'reviews' => $reviews,
            'filters' => [
                'q' => $search,
                'tab' => $tab,
            ],
            'messageListingSlug' => $messageListing?->slug,
            'canReview' => $canReview,
            'hasReviewed' => $hasReviewed,
        ]);
    }

    public function storeReview(
        StoreSellerReviewRequest $request,
        User $seller,
    ): RedirectResponse {
        $user = $request->user();

        abort_if($user->id === $seller->id, 403, 'You cannot review yourself.');
        abort_unless($seller->hasConversationWith($user->id), 403, 'Message the seller before leaving a review.');

        $existing = SellerReview::query()
            ->where('seller_id', $seller->id)
            ->where('reviewer_id', $user->id)
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'rating' => 'You have already reviewed this seller.',
            ]);
        }

        $listingId = $request->integer('vehicle_listing_id') ?: null;

        if ($listingId) {
            $listing = VehicleListing::query()->findOrFail($listingId);
            abort_unless($listing->user_id === $seller->id, 422);
        }

        SellerReview::query()->create([
            'seller_id' => $seller->id,
            'reviewer_id' => $user->id,
            'vehicle_listing_id' => $listingId,
            'rating' => $request->integer('rating'),
            'body' => $request->input('body'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Thank you for your review!',
        ]);

        return redirect()->route('sellers.show', [
            'seller' => $seller,
            'tab' => 'reviews',
        ]);
    }

    /**
     * @return array{average: ?float, count: int, distribution: array<int, int>}
     */
    public static function ratingStats(User $seller): array
    {
        $counts = SellerReview::query()
            ->where('seller_id', $seller->id)
            ->selectRaw('rating, count(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $distribution = [];

        for ($star = 5; $star >= 1; $star--) {
            $distribution[$star] = (int) ($counts[$star] ?? 0);
        }

        $count = array_sum($distribution);
        $average = $count > 0
            ? round(
                SellerReview::query()
                    ->where('seller_id', $seller->id)
                    ->avg('rating'),
                1,
            )
            : null;

        return [
            'average' => $average,
            'count' => $count,
            'distribution' => $distribution,
        ];
    }
}
