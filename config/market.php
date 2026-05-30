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

];
