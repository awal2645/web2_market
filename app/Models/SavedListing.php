<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'vehicle_listing_id',
    'saved_price',
    'price_alerts_enabled',
])]
class SavedListing extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'vehicle_listing_id' => 'integer',
            'saved_price' => 'integer',
            'price_alerts_enabled' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<VehicleListing, $this>
     */
    public function vehicleListing(): BelongsTo
    {
        return $this->belongsTo(VehicleListing::class);
    }
}
