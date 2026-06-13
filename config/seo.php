<?php

return [

    'site_name' => env('SEO_SITE_NAME', env('APP_NAME', 'Web2Autos')),

    'default_description' => env(
        'SEO_DEFAULT_DESCRIPTION',
        'Buy and sell vehicles on Web2Autos. Browse cars, trucks, and SUVs from private sellers, or list your vehicle for free.',
    ),

    'default_image' => env('SEO_DEFAULT_IMAGE', '/images/demo-vehicles/car-2.jpg'),

    'twitter_handle' => env('SEO_TWITTER_HANDLE'),

];
