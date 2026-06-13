<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Auth\Authenticatable as AuthenticatableTrait;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable([
    'name',
    'email',
    'phone',
    'image_url',
    'address',
    'password',
    'password_hash',
    'is_admin',
    'listing_prompt_completed_at',
])]
#[Hidden(['password_hash'])]
class User extends Model implements AuthenticatableContract, CanResetPasswordContract
{
    /** @use HasFactory<UserFactory> */
    use AuthenticatableTrait, CanResetPassword, HasFactory, Notifiable;

    protected $table = 'customer_users';

    protected $keyType = 'string';

    public $incrementing = false;

    const CREATED_AT = 'created_at';

    const UPDATED_AT = 'updated_at';

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            if (! $user->getKey()) {
                $user->setAttribute($user->getKeyName(), (string) Str::uuid());
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_admin' => 'boolean',
            'listing_prompt_completed_at' => 'datetime',
        ];
    }

    public function hasVerifiedEmail(): bool
    {
        return true;
    }

    public function getAuthPassword(): string
    {
        return (string) $this->password_hash;
    }

    public function setRememberToken($value): void
    {
        // customer_users has no remember_token column (shared with web2autos-next).
    }

    public function getRememberToken(): ?string
    {
        return null;
    }

    public function getRememberTokenName(): string
    {
        return 'remember_token';
    }

    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password_hash'] = Hash::make($value);
    }

    /**
     * @return Attribute<?string, ?string>
     */
    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: function (?string $value, array $attributes): ?string {
                $imageUrl = $attributes['image_url'] ?? null;

                if (! $imageUrl) {
                    return null;
                }

                if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
                    return $imageUrl;
                }

                return Storage::disk('public')->url($imageUrl);
            },
            set: fn (?string $value) => ['image_url' => $value],
        );
    }

    public function needsListingPrompt(): bool
    {
        return $this->listing_prompt_completed_at === null;
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    /**
     * @return HasMany<VehicleListing, $this>
     */
    public function vehicleListings(): HasMany
    {
        return $this->hasMany(VehicleListing::class);
    }

    /**
     * @return HasMany<SellerReview, $this>
     */
    public function sellerReviews(): HasMany
    {
        return $this->hasMany(SellerReview::class, 'seller_id');
    }

    /**
     * @return HasMany<SellerReview, $this>
     */
    public function reviewsWritten(): HasMany
    {
        return $this->hasMany(SellerReview::class, 'reviewer_id');
    }

    public function averageRating(): ?float
    {
        $average = $this->sellerReviews()->avg('rating');

        return $average !== null ? round((float) $average, 1) : null;
    }

    public function reviewCount(): int
    {
        return $this->sellerReviews()->count();
    }

    public function hasConversationWith(string $userId): bool
    {
        return Conversation::query()
            ->where(function ($query) use ($userId): void {
                $query->where(function ($inner) use ($userId): void {
                    $inner->where('participant_one_id', $this->id)
                        ->where('participant_two_id', $userId);
                })->orWhere(function ($inner) use ($userId): void {
                    $inner->where('participant_one_id', $userId)
                        ->where('participant_two_id', $this->id);
                });
            })
            ->exists();
    }

    public function unreadMessagesCount(): int
    {
        return Message::query()
            ->where('sender_id', '!=', $this->id)
            ->whereNull('read_at')
            ->whereHas('conversation', function ($query): void {
                $query->where('participant_one_id', $this->id)
                    ->orWhere('participant_two_id', $this->id);
            })
            ->count();
    }
}
