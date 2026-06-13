<?php

use App\Enums\ListingStatus;
use App\Mail\ListingApprovedMail;
use App\Mail\NewMessageMail;
use App\Models\SavedListing;
use App\Models\User;
use App\Models\VehicleListing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('users can save and unsave approved listings', function () {
    Mail::fake();

    $buyer = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create();

    $this->actingAs($buyer)
        ->post(route('saved-listings.store', $listing))
        ->assertRedirect();

    expect(SavedListing::query()->count())->toBe(1);

    $this->actingAs($buyer)
        ->get(route('saved-listings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('saved/index')
            ->has('listings', 1)
            ->where('listings.0.id', $listing->id)
        );

    $this->actingAs($buyer)
        ->delete(route('saved-listings.destroy', $listing))
        ->assertRedirect();

    expect(SavedListing::query()->count())->toBe(0);
});

test('browse supports location and advanced filters', function () {
    VehicleListing::factory()->approved()->create([
        'make' => 'Toyota',
        'model' => 'Camry',
        'state' => 'CA',
        'transmission' => 'Automatic',
        'fuel_type' => 'Hybrid',
        'body_type' => 'Sedan',
        'mileage' => 42000,
    ]);

    VehicleListing::factory()->approved()->create([
        'make' => 'Ford',
        'model' => 'F-150',
        'state' => 'TX',
        'transmission' => 'Manual',
        'fuel_type' => 'Gasoline',
        'body_type' => 'Truck',
        'mileage' => 90000,
    ]);

    $response = $this->get(route('browse', [
        'make' => 'Toyota',
        'state' => 'CA',
        'transmission' => 'Automatic',
        'fuel_type' => 'Hybrid',
        'body_type' => 'Sedan',
        'mileage' => 'Under 50,000',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('listings.data', 1)
        ->where('listings.data.0.make', 'Toyota')
        ->has('filterOptions.modelsByMake.Toyota')
    );
});

test('browse model options depend on selected make', function () {
    VehicleListing::factory()->approved()->create([
        'make' => 'Toyota',
        'model' => 'Camry',
    ]);

    VehicleListing::factory()->approved()->create([
        'make' => 'Toyota',
        'model' => 'Corolla',
    ]);

    VehicleListing::factory()->approved()->create([
        'make' => 'Ford',
        'model' => 'F-150',
    ]);

    $response = $this->get(route('browse', ['make' => 'Toyota']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('filterOptions.modelsByMake.Toyota', fn ($models) => collect($models)->contains('Camry')
            && collect($models)->contains('Corolla'))
    );
});

test('sellers can mark approved listings as sold', function () {
    $seller = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create([
        'user_id' => $seller->id,
    ]);

    $this->actingAs($seller)
        ->post(route('listings.mark-sold', $listing))
        ->assertRedirect();

    expect($listing->fresh()->status)->toBe(ListingStatus::Sold);

    $this->get(route('browse'))
        ->assertInertia(fn ($page) => $page->has('listings.data', 0));
});

test('admin approval sends listing approved email', function () {
    Mail::fake();

    $admin = User::factory()->create(['is_admin' => true]);
    $listing = VehicleListing::factory()->create(['status' => 'pending']);

    $this->actingAs($admin)
        ->post(route('admin.listings.approve', $listing))
        ->assertRedirect();

    Mail::assertQueued(ListingApprovedMail::class, function (ListingApprovedMail $mail) use ($listing) {
        return $mail->listing->is($listing);
    });
});

test('sending a message notifies the recipient by email', function () {
    Mail::fake();

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create([
        'user_id' => $seller->id,
    ]);

    $this->actingAs($buyer)->post(route('messages.store'), [
        'recipient_id' => $seller->id,
        'vehicle_listing_id' => $listing->id,
        'body' => 'Is this still available?',
    ])->assertRedirect();

    Mail::assertQueued(NewMessageMail::class);
});
