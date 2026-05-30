<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketSetting extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'listing_approval_mode',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'listing_approval_mode' => config('market.listing_approval_mode', 'manual'),
        ]);
    }
}
