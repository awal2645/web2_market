<?php

use App\Models\User;
use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

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
        'city' => 'Los Angeles',
        'state' => 'CA',
        'asking_price' => 18500,
        'mileage' => 45000,
        'seller_notes' => 'One-owner car.',
    ]);

    VehicleListingImage::query()->create([
        'vehicle_listing_id' => $listing->id,
        'path' => 'vehicle-listings/front.jpg',
        'sort_order' => 0,
    ]);

    $response = $this->get(route('listings.show', $listing));
    $ogImage = rtrim(config('app.url'), '/').'/market/'.$listing->slug.'/og.jpg';

    $response->assertOk();
    $response->assertSee('<meta property="og:title" content="'.$listing->title().'">', false);
    $response->assertSee('<meta property="og:image" content="'.$ogImage.'">', false);
    $response->assertSee('<meta property="og:image:width" content="1200">', false);
    $response->assertSee('<meta property="og:image:height" content="630">', false);
    $response->assertSee('<title>'.$listing->title().' - '.config('seo.site_name').'</title>', false);
    $response->assertSee('Listed on Web2Autos Market.', false);
    $response->assertSee('One-owner car.', false);
});

test('listing open graph image is resized for social previews', function () {
    Storage::fake('public');

    $listing = VehicleListing::factory()->approved()->create([
        'year' => 2013,
        'make' => 'Honda',
        'model' => 'Accord',
        'trim' => 'LX',
    ]);

    $image = imagecreatetruecolor(800, 800);
    $gray = imagecolorallocate($image, 120, 120, 120);
    imagefilledrectangle($image, 0, 0, 799, 799, $gray);
    ob_start();
    imagejpeg($image, null, 90);
    $binary = ob_get_clean();
    imagedestroy($image);

    Storage::disk('public')->put('vehicle-listings/square.jpg', $binary);

    VehicleListingImage::query()->create([
        'vehicle_listing_id' => $listing->id,
        'path' => 'vehicle-listings/square.jpg',
        'sort_order' => 0,
    ]);

    $response = $this->get(route('listings.og-image', $listing));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'image/jpeg');

    $fileResponse = $response->baseResponse;
    expect($fileResponse)->toBeInstanceOf(Symfony\Component\HttpFoundation\BinaryFileResponse::class);

    $path = $fileResponse->getFile()->getPathname();
    expect($path)->toContain('og-cache');

    $generated = imagecreatefromjpeg($path);
    expect($generated)->not->toBeFalse();
    expect(imagesx($generated))->toBe(1200);
    expect(imagesy($generated))->toBe(630);
    imagedestroy($generated);
});
