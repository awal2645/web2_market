<?php

namespace App\Models;

use App\Enums\ListingStatus;
use Database\Factories\VehicleListingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'year',
    'make',
    'model',
    'trim',
    'mileage',
    'vin',
    'title_status',
    'condition',
    'exterior_color',
    'interior_color',
    'transmission',
    'fuel_type',
    'drivetrain',
    'asking_price',
    'seller_notes',
    'contact_name',
    'contact_email',
    'contact_phone',
    'status',
])]
class VehicleListing extends Model
{
    /** @use HasFactory<VehicleListingFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ListingStatus::class,
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
     * @return HasMany<VehicleListingImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(VehicleListingImage::class)->orderBy('sort_order');
    }

    public function isApproved(): bool
    {
        return $this->status === ListingStatus::Approved;
    }

    public function title(): string
    {
        $title = "{$this->year} {$this->make} {$this->model}";

        if ($this->trim) {
            $title .= " {$this->trim}";
        }

        return $title;
    }
}
