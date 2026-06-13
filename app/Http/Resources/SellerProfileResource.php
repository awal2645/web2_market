<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Models\VehicleListing;

class SellerProfileResource
{
    /**
     * @param  array<int, int>  $ratingDistribution
     * @return array<string, mixed>
     */
    public static function make(
        User $seller,
        ?float $averageRating,
        int $reviewCount,
        array $ratingDistribution,
        int $activeListingCount,
        ?VehicleListing $contactListing = null,
    ): array {
        return [
            'id' => $seller->id,
            'slug' => $seller->slug,
            'name' => $seller->name ?? 'Seller',
            'is_dealer' => (bool) $seller->is_dealer,
            'avatar' => $seller->avatar,
            'member_since' => $seller->created_at?->toISOString(),
            'average_rating' => $averageRating,
            'review_count' => $reviewCount,
            'rating_distribution' => $ratingDistribution,
            'active_listing_count' => $activeListingCount,
            'phone' => $seller->phone ?: $contactListing?->contact_phone,
            'email' => $contactListing?->contact_email,
            'address' => $seller->address,
            'profile_url' => route('sellers.show', $seller, absolute: false),
        ];
    }
}
