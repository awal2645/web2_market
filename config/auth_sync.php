<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-app session sync (web2autos-next ↔ market)
    |--------------------------------------------------------------------------
    |
    | AUTH_SYNC_SECRET must match web2autos-next. When set, a successful login
    | on this app redirects through the partner to establish its session too.
    |
    */

    'secret' => env('AUTH_SYNC_SECRET'),

    'web2autos_url' => env('WEB2AUTOS_URL'),

    'token_ttl_seconds' => (int) env('AUTH_SYNC_TOKEN_TTL', 120),

];
