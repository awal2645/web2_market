<?php

use App\Models\User;
use App\Models\VehicleListing;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('homepage displays approved listings', function () {
    $listing = VehicleListing::factory()->approved()->create([
        'make' => 'Toyota',
        'model' => 'Camry',
        'year' => 2020,
    ]);

    VehicleListing::factory()->create([
        'status' => 'pending',
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('welcome')
        ->has('listings', 1)
        ->where('listings.0.id', $listing->id)
    );
});

test('new users are redirected to listing prompt after registration', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false));
});

test('users can skip listing prompt and see congratulations page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('onboarding.skip'));

    $response->assertRedirect(route('onboarding.congratulations', absolute: false));
    expect($user->fresh()->listing_prompt_completed_at)->not->toBeNull();
});

test('users can view their listings index', function () {
    $user = User::factory()->create();
    $listing = VehicleListing::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('listings.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('listings/index')
        ->has('listings', 1)
        ->where('listings.0.id', $listing->id)
    );
});

test('browse page filters approved listings', function () {
    VehicleListing::factory()->approved()->create([
        'make' => 'Toyota',
        'model' => 'Camry',
        'year' => 2020,
    ]);

    VehicleListing::factory()->approved()->create([
        'make' => 'Honda',
        'model' => 'Accord',
    ]);

    $response = $this->get(route('browse', ['make' => 'Toyota']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('market/browse')
        ->has('listings.data', 1)
        ->where('listings.data.0.make', 'Toyota')
    );
});

test('dashboard shows real user listing stats', function () {
    $user = User::factory()->create();

    VehicleListing::factory()->approved()->create(['user_id' => $user->id]);
    VehicleListing::factory()->create(['user_id' => $user->id, 'status' => 'pending']);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('stats.total', 2)
        ->where('stats.approved', 1)
        ->where('stats.pending', 1)
        ->has('recentListings', 2)
    );
});

test('approved listing detail page can be viewed publicly', function () {
    $listing = VehicleListing::factory()->approved()->create([
        'make' => 'Toyota',
        'model' => 'Camry',
    ]);

    $response = $this->get(route('listings.show', $listing));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('listings/show')
        ->where('listing.id', $listing->id)
        ->where('isOwner', false)
    );
});

test('users can submit a vehicle listing with images', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('listings.store'), [
        'year' => 2020,
        'make' => 'Honda',
        'model' => 'Civic',
        'trim' => 'EX',
        'mileage' => 45000,
        'vin' => '1HGBH41JXMN109186',
        'title_status' => 'Clean',
        'condition' => 'Good',
        'exterior_color' => 'Blue',
        'interior_color' => 'Black',
        'transmission' => 'Automatic',
        'fuel_type' => 'Gasoline',
        'drivetrain' => 'FWD',
        'asking_price' => 18500,
        'seller_notes' => 'Well maintained.',
        'contact_name' => 'John Seller',
        'contact_email' => 'seller@example.com',
        'contact_phone' => '555-123-4567',
        'images' => [
            UploadedFile::fake()->image('front.jpg'),
            UploadedFile::fake()->image('side.jpg'),
        ],
    ]);

    $listing = VehicleListing::query()->first();

    $response->assertRedirect(route('listings.index', absolute: false));

    expect($listing)->not->toBeNull();
    expect($listing->images)->toHaveCount(2);
    expect($user->fresh()->listing_prompt_completed_at)->not->toBeNull();
});

test('manual approval keeps new listings pending', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)->post(route('listings.store'), listingPayload());

    expect(VehicleListing::query()->first()->status->value)->toBe('pending');
});

test('automatic approval publishes listings immediately', function () {
    Storage::fake('public');

    \App\Models\MarketSetting::current()->update([
        'listing_approval_mode' => 'automatic',
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)->post(route('listings.store'), listingPayload());

    expect(VehicleListing::query()->first()->status->value)->toBe('approved');
});

test('admin can approve and reject listings', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $listing = VehicleListing::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.listings.approve', $listing))
        ->assertRedirect();

    expect($listing->fresh()->status->value)->toBe('approved');

    $this->actingAs($admin)
        ->post(route('admin.listings.reject', $listing))
        ->assertRedirect();

    expect($listing->fresh()->status->value)->toBe('rejected');
});

test('non admin cannot access admin listings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.listings.index'))
        ->assertForbidden();
});

/**
 * @return array<string, mixed>
 */
function listingPayload(): array
{
    return [
        'year' => 2019,
        'make' => 'Ford',
        'model' => 'F-150',
        'trim' => 'XLT',
        'mileage' => 62000,
        'vin' => '1FTFW1ET5DFC12345',
        'title_status' => 'Clean',
        'condition' => 'Good',
        'exterior_color' => 'White',
        'interior_color' => 'Gray',
        'transmission' => 'Automatic',
        'fuel_type' => 'Gasoline',
        'drivetrain' => '4WD',
        'asking_price' => 32000,
        'seller_notes' => null,
        'contact_name' => 'Jane Seller',
        'contact_email' => 'jane@example.com',
        'contact_phone' => '555-987-6543',
        'images' => [
            UploadedFile::fake()->image('truck.jpg'),
        ],
    ];
}
