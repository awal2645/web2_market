<?php

use App\Mail\PriceDropMail;
use App\Models\ListingReport;
use App\Models\SavedListing;
use App\Models\User;
use App\Models\VehicleListing;
use App\Services\SavedListingPriceAlerts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('seller profiles use slug urls with redirect from id', function () {
    $seller = User::factory()->create(['name' => 'Jane Dealer']);

    expect($seller->slug)->not->toBeEmpty();

    $this->get("/sellers/{$seller->id}")
        ->assertRedirect(route('sellers.show', $seller));

    $this->get(route('sellers.show', $seller))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sellers/show')
            ->where('seller.slug', $seller->slug)
        );
});

test('listing detail increments view count once per session', function () {
    $listing = VehicleListing::factory()->approved()->create(['view_count' => 0]);

    $this->get(route('listings.show', $listing))->assertOk();
    expect($listing->fresh()->view_count)->toBe(1);

    $this->get(route('listings.show', $listing))->assertOk();
    expect($listing->fresh()->view_count)->toBe(1);
});

test('users can report a listing', function () {
    $listing = VehicleListing::factory()->approved()->create();

    $this->post(route('listings.report', $listing), [
        'reason' => 'Suspected fraud',
        'details' => 'Looks suspicious',
    ])->assertRedirect();

    expect(ListingReport::query()->count())->toBe(1);
});

test('compare session stores up to four listings', function () {
    $listings = VehicleListing::factory()->approved()->count(2)->create();

    $this->post(route('compare.store', $listings[0]))->assertRedirect();
    $this->post(route('compare.store', $listings[1]))->assertRedirect();

    $this->get(route('compare.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('compare/index')
            ->has('listings', 2)
        );
});

test('browse seo path filters by make and model', function () {
    VehicleListing::factory()->approved()->create([
        'make' => 'Toyota',
        'model' => 'Camry',
    ]);

    VehicleListing::factory()->approved()->create([
        'make' => 'Ford',
        'model' => 'F-150',
    ]);

    $this->get('/browse/toyota/camry')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('listings.data', 1)
            ->where('listings.data.0.make', 'Toyota')
            ->where('listings.data.0.model', 'Camry')
        );
});

test('vin decode endpoint returns decoded data', function () {
    Http::fake([
        'vpic.nhtsa.dot.gov/*' => Http::response([
            'Results' => [
                ['Variable' => 'Model Year', 'Value' => '2020'],
                ['Variable' => 'Make', 'Value' => 'Honda'],
                ['Variable' => 'Model', 'Value' => 'Civic'],
            ],
        ]),
    ]);

    $response = $this->getJson(route('vin.decode', ['vin' => '1HGBH41JXMN109186']));

    $response->assertOk();
    $response->assertJsonPath('data.make', 'Honda');
    $response->assertJsonPath('data.model', 'Civic');
});

test('users can toggle price drop alerts on saved listings', function () {
    $user = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create();

    SavedListing::query()->create([
        'user_id' => $user->id,
        'vehicle_listing_id' => $listing->id,
        'saved_price' => $listing->asking_price,
        'price_alerts_enabled' => true,
    ]);

    $this->actingAs($user)
        ->patch(route('saved-listings.alerts', $listing), [
            'price_alerts_enabled' => false,
        ])
        ->assertRedirect();

    expect(
        SavedListing::query()
            ->where('user_id', $user->id)
            ->where('vehicle_listing_id', $listing->id)
            ->value('price_alerts_enabled')
    )->toBeFalse();
});

test('price drop emails are sent when listing price decreases', function () {
    Mail::fake();

    $buyer = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create([
        'asking_price' => 25000,
    ]);

    SavedListing::query()->create([
        'user_id' => $buyer->id,
        'vehicle_listing_id' => $listing->id,
        'saved_price' => 25000,
        'price_alerts_enabled' => true,
    ]);

    $listing->update(['asking_price' => 22000]);

    app(SavedListingPriceAlerts::class)->notifyIfPriceDropped(
        $listing->fresh(),
        25000,
    );

    Mail::assertQueued(PriceDropMail::class);
});
