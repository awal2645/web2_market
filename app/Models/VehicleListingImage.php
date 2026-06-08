<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'vehicle_listing_id',
    'path',
    'sort_order',
])]
class VehicleListingImage extends Model
{
    /**
     * @return BelongsTo<VehicleListing, $this>
     */
    public function listing(): BelongsTo
    {
        return $this->belongsTo(VehicleListing::class, 'vehicle_listing_id');
    }

    public function url(): string
    {
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }

        return '/storage/'.ltrim($this->path, '/');
    }
}
