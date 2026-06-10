<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'participant_one_id',
    'participant_two_id',
    'vehicle_listing_id',
    'last_message_at',
])]
class Conversation extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Conversation $conversation): void {
            if (! $conversation->getKey()) {
                $conversation->setAttribute($conversation->getKeyName(), (string) Str::uuid());
            }
        });
    }

    /**
     * @return array{0: string, 1: string}
     */
    public static function sortedParticipantIds(string $userA, string $userB): array
    {
        return strcmp($userA, $userB) < 0
            ? [$userA, $userB]
            : [$userB, $userA];
    }

    public static function findBetween(
        string $userA,
        string $userB,
        ?int $vehicleListingId = null,
    ): ?self {
        [$participantOne, $participantTwo] = self::sortedParticipantIds($userA, $userB);

        $query = self::query()
            ->where('participant_one_id', $participantOne)
            ->where('participant_two_id', $participantTwo);

        if ($vehicleListingId) {
            $query->where('vehicle_listing_id', $vehicleListingId);
        } else {
            $query->whereNull('vehicle_listing_id');
        }

        return $query->first();
    }

    public static function findOrCreateBetween(
        string $userA,
        string $userB,
        ?int $vehicleListingId = null,
    ): self {
        [$participantOne, $participantTwo] = self::sortedParticipantIds($userA, $userB);

        $query = self::query()
            ->where('participant_one_id', $participantOne)
            ->where('participant_two_id', $participantTwo);

        if ($vehicleListingId) {
            $query->where('vehicle_listing_id', $vehicleListingId);
        } else {
            $query->whereNull('vehicle_listing_id');
        }

        $existing = $query->first();

        if ($existing) {
            return $existing;
        }

        return self::query()->create([
            'participant_one_id' => $participantOne,
            'participant_two_id' => $participantTwo,
            'vehicle_listing_id' => $vehicleListingId,
            'last_message_at' => null,
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function summaryForListing(User $user, VehicleListing $listing): ?array
    {
        $conversation = self::findBetween($user->id, $listing->user_id, $listing->id);

        if (! $conversation) {
            return null;
        }

        $conversation->load(['messages' => fn ($query) => $query->latest()->limit(1)]);

        $latestMessage = $conversation->messages->first();

        return [
            'id' => $conversation->id,
            'url' => route('messages.show', $conversation, absolute: false),
            'last_message' => $latestMessage?->body,
            'last_message_at' => $conversation->last_message_at?->toISOString(),
        ];
    }

    public function includesUser(string $userId): bool
    {
        return $this->participant_one_id === $userId
            || $this->participant_two_id === $userId;
    }

    public function otherParticipantId(string $userId): string
    {
        return $this->participant_one_id === $userId
            ? $this->participant_two_id
            : $this->participant_one_id;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function participantOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_one_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function participantTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_two_id');
    }

    /**
     * @return BelongsTo<VehicleListing, $this>
     */
    public function vehicleListing(): BelongsTo
    {
        return $this->belongsTo(VehicleListing::class);
    }

    /**
     * @return HasMany<Message, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }
}
