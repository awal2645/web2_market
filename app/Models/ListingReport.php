<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'vehicle_listing_id',
    'user_id',
    'reason',
    'details',
    'status',
])]
class ListingReport extends Model
{
    /**
     * @return BelongsTo<VehicleListing, $this>
     */
    public function vehicleListing(): BelongsTo
    {
        return $this->belongsTo(VehicleListing::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
