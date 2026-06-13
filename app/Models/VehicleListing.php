<?php

namespace App\Models;

use App\Enums\ListingStatus;
use Database\Factories\VehicleListingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'user_id',
    'slug',
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

    protected static function booted(): void
    {
        static::creating(function (VehicleListing $listing): void {
            if (blank($listing->slug)) {
                $listing->slug = static::generateUniqueSlug($listing);
            }
        });

        static::updating(function (VehicleListing $listing): void {
            if ($listing->isDirty(['year', 'make', 'model', 'trim'])) {
                $listing->slug = static::generateUniqueSlug($listing);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @param  mixed  $value
     * @param  string|null  $field
     */
    public function resolveRouteBinding($value, $field = null): Model
    {
        if (is_numeric($value)) {
            $listing = static::query()->whereKey($value)->first();

            if ($listing) {
                return $listing;
            }
        }

        $listing = static::query()->where('slug', $value)->first();

        if ($listing) {
            return $listing;
        }

        throw (new ModelNotFoundException)->setModel(static::class, [$value]);
    }

    public static function generateUniqueSlug(VehicleListing $listing): string
    {
        $base = Str::slug(implode(' ', array_filter([
            (string) $listing->year,
            $listing->make,
            $listing->model,
            $listing->trim,
        ])));

        if ($base === '') {
            $base = 'listing';
        }

        $slug = $base;
        $counter = 2;

        while (
            static::query()
                ->where('slug', $slug)
                ->when($listing->exists, fn ($query) => $query->whereKeyNot($listing->id))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

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
