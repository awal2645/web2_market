<?php

use App\Models\User;
use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('sitemap returns xml with public pages', function () {
    $listing = VehicleListing::factory()->approved()->create();
    $seller = User::find($listing->user_id);

    $response = $this->get(route('sitemap'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/xml');
    $response->assertSee(route('home'), false);
    $response->assertSee(route('browse'), false);
    $response->assertSee(route('listings.show', $listing), false);
    $response->assertSee(route('sellers.show', $seller), false);
});

test('sitemap excludes pending listings', function () {
    $pending = VehicleListing::factory()->create([
        'status' => 'pending',
    ]);

    $response = $this->get(route('sitemap'));

    $response->assertOk();
    $response->assertDontSee(route('listings.show', $pending), false);
});

test('robots.txt disallows private routes and references sitemap', function () {
    $contents = file_get_contents(public_path('robots.txt'));

    expect($contents)->toContain('Disallow: /dashboard');
    expect($contents)->toContain('Disallow: /messages');
    expect($contents)->toContain('Sitemap: /sitemap.xml');
});

test('seo defaults are shared with inertia pages', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('seo.appUrl')
        ->has('seo.siteName')
        ->has('seo.defaultDescription')
        ->has('seo.defaultImage')
    );
});

test('listing pages expose open graph tags for crawlers', function () {
    $listing = VehicleListing::factory()->approved()->create([
        'year' => 2021,
        'make' => 'Honda',
        'model' => 'Accord',
        'trim' => 'EX',
        'seller_notes' => 'One-owner car in excellent condition.',
    ]);

    VehicleListingImage::query()->create([
        'vehicle_listing_id' => $listing->id,
        'path' => 'vehicle-listings/front.jpg',
        'sort_order' => 0,
    ]);

    $response = $this->get(route('listings.show', $listing));

    $response->assertOk();
    $response->assertSee('<meta property="og:title" content="'.$listing->title().'">', false);
    $response->assertSee('<meta property="og:image" content="'.rtrim(config('app.url'), '/').'/storage/vehicle-listings/front.jpg">', false);
    $response->assertSee('<title>'.$listing->title().' - '.config('seo.site_name').'</title>', false);
    $response->assertSee('One-owner car in excellent condition.', false);
});
