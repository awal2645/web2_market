<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Listing Approval Mode
    |--------------------------------------------------------------------------
    |
    | Supported: "manual", "automatic"
    |
    | manual     - Admin must approve listings before they appear on the homepage.
    | automatic  - Listings go live immediately after submission.
    |
    */

    'listing_approval_mode' => env('MARKET_LISTING_APPROVAL_MODE', 'manual'),

    'require_email_verification' => env('MARKET_REQUIRE_EMAIL_VERIFICATION', false),

    'compare_max_items' => 4,

    'message_poll_seconds' => env('MARKET_MESSAGE_POLL_SECONDS', 5),

];
