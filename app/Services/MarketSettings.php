<?php

namespace App\Services;

use App\Enums\ListingApprovalMode;
use App\Enums\ListingStatus;
use App\Models\MarketSetting;

class MarketSettings
{
    public function approvalMode(): ListingApprovalMode
    {
        $mode = MarketSetting::current()->listing_approval_mode;

        return ListingApprovalMode::tryFrom($mode) ?? ListingApprovalMode::Manual;
    }

    public function setApprovalMode(ListingApprovalMode $mode): void
    {
        $settings = MarketSetting::current();
        $settings->listing_approval_mode = $mode->value;
        $settings->save();
    }

    public function initialListingStatus(): ListingStatus
    {
        return $this->approvalMode() === ListingApprovalMode::Automatic
            ? ListingStatus::Approved
            : ListingStatus::Pending;
    }
}
