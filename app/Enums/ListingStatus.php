<?php

namespace App\Enums;

enum ListingStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Sold = 'sold';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending Review',
            self::Approved => 'Approved',
            self::Rejected => 'Rejected',
            self::Sold => 'Sold',
        };
    }
}
