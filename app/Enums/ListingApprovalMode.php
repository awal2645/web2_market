<?php

namespace App\Enums;

enum ListingApprovalMode: string
{
    case Manual = 'manual';
    case Automatic = 'automatic';

    public function label(): string
    {
        return match ($this) {
            self::Manual => 'Manual Approval',
            self::Automatic => 'Automatic Approval',
        };
    }
}
