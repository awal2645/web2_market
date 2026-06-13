<?php

namespace App\Http\Resources;

use App\Models\SellerReview;

class SellerReviewResource
{
    /**
     * @return array<string, mixed>
     */
    public static function make(SellerReview $review): array
    {
        $review->loadMissing(['reviewer', 'vehicleListing']);

        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'body' => $review->body,
            'reviewer_name' => $review->reviewer?->name ?? 'Anonymous',
            'reviewer_avatar' => $review->reviewer?->avatar,
            'listing_title' => $review->vehicleListing?->title(),
            'created_at' => $review->created_at?->toISOString(),
        ];
    }
}
