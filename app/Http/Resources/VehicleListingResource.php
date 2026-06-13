<?php

namespace App\Http\Resources;

use App\Models\VehicleListing;
use App\Models\VehicleListingImage;

class VehicleListingResource
{
    /**
     * @return array<string, mixed>
     */
    public static function make(VehicleListing $listing, bool $isSaved = false): array
    {
        $listing->loadMissing('images');

        return [
            'id' => $listing->id,
            'slug' => $listing->slug,
            'title' => $listing->title(),
            'seller_id' => $listing->user_id,
            'seller_name' => $listing->relationLoaded('user') ? ($listing->user?->name) : null,
            'seller_avatar' => $listing->relationLoaded('user') ? ($listing->user?->avatar) : null,
            'year' => $listing->year,
            'make' => $listing->make,
            'model' => $listing->model,
            'trim' => $listing->trim,
            'mileage' => $listing->mileage,
            'vin' => $listing->vin,
            'title_status' => $listing->title_status,
            'condition' => $listing->condition,
            'exterior_color' => $listing->exterior_color,
            'interior_color' => $listing->interior_color,
            'transmission' => $listing->transmission,
            'fuel_type' => $listing->fuel_type,
            'drivetrain' => $listing->drivetrain,
            'body_type' => $listing->body_type,
            'city' => $listing->city,
            'state' => $listing->state,
            'zip_code' => $listing->zip_code,
            'location_label' => $listing->locationLabel(),
            'asking_price' => $listing->asking_price,
            'seller_notes' => $listing->seller_notes,
            'contact_name' => $listing->contact_name,
            'contact_email' => $listing->contact_email,
            'contact_phone' => $listing->contact_phone,
            'status' => $listing->status->value,
            'status_label' => $listing->status->label(),
            'view_count' => $listing->view_count ?? 0,
            'is_saved' => $isSaved,
            'images' => $listing->images->map(fn (VehicleListingImage $image) => [
                'id' => $image->id,
                'url' => $image->url(),
            ])->values()->all(),
            'created_at' => $listing->created_at?->toISOString(),
        ];
    }
}
