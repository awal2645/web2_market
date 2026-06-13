<?php

use App\Models\MarketSetting;
use App\Models\User;
use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

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
    $response->assertRedirect(route('onboarding.list-vehicle', absolute: false));
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
        ->where('listing.slug', $listing->slug)
        ->where('isOwner', false)
    );
});

test('listing detail page redirects numeric id urls to slug', function () {
    $listing = VehicleListing::factory()->approved()->create([
        'year' => 2020,
        'make' => 'Toyota',
        'model' => 'Camry',
    ]);

    $this->get("/market/{$listing->id}")
        ->assertRedirect(route('listings.show', $listing));
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
        'body_type' => 'Sedan',
        'city' => 'Los Angeles',
        'state' => 'CA',
        'zip_code' => '90001',
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

    $response->assertRedirect(route('listings.create', ['step' => 'success'], absolute: false));

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

    MarketSetting::current()->update([
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

test('users can filter their listings', function () {
    $user = User::factory()->create();

    VehicleListing::factory()->approved()->create([
        'user_id' => $user->id,
        'make' => 'Honda',
        'model' => 'Civic',
    ]);

    VehicleListing::factory()->create([
        'user_id' => $user->id,
        'status' => 'pending',
        'make' => 'Ford',
        'model' => 'F-150',
    ]);

    $this->actingAs($user)
        ->get(route('listings.index', ['status' => 'approved']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('listings/index')
            ->has('listings', 1)
            ->where('listings.0.make', 'Honda')
            ->where('filters.status', 'approved')
        );

    $this->actingAs($user)
        ->get(route('listings.index', ['q' => 'Ford']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('listings', 1)
            ->where('listings.0.make', 'Ford')
        );
});

test('users can edit their own listings', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $listing = VehicleListing::factory()->create([
        'user_id' => $user->id,
        'make' => 'Toyota',
        'asking_price' => 15000,
        'vin' => '1HGBH41JXMN109186',
    ]);

    VehicleListingImage::query()->create([
        'vehicle_listing_id' => $listing->id,
        'path' => 'vehicle-listings/test.jpg',
        'sort_order' => 0,
    ]);

    $this->actingAs($user)
        ->get(route('listings.edit', $listing))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('listings/edit')
            ->where('listing.id', $listing->id)
        );

    $this->actingAs($user)
        ->put(route('listings.update', $listing), [
            'year' => $listing->year,
            'make' => 'Toyota',
            'model' => $listing->model,
            'trim' => $listing->trim,
            'mileage' => $listing->mileage,
            'vin' => $listing->vin,
            'title_status' => $listing->title_status,
            'condition' => $listing->condition,
            'exterior_color' => $listing->exterior_color,
            'interior_color' => $listing->interior_color,
            'transmission' => $listing->transmission,
            'fuel_type' => $listing->fuel_type,
            'drivetrain' => $listing->drivetrain,
            'body_type' => $listing->body_type,
            'city' => $listing->city,
            'state' => $listing->state,
            'zip_code' => $listing->zip_code,
            'asking_price' => 16500,
            'seller_notes' => $listing->seller_notes,
            'contact_name' => $listing->contact_name,
            'contact_email' => $listing->contact_email,
            'contact_phone' => $listing->contact_phone,
        ])
        ->assertRedirect(route('listings.edit', ['listing' => $listing, 'step' => 'success'], absolute: false));

    expect($listing->fresh()->asking_price)->toBe(16500);
});

test('users can delete their own listings', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $listing = VehicleListing::factory()->create(['user_id' => $user->id]);

    VehicleListingImage::query()->create([
        'vehicle_listing_id' => $listing->id,
        'path' => 'vehicle-listings/test.jpg',
        'sort_order' => 0,
    ]);

    $this->actingAs($user)
        ->delete(route('listings.destroy', $listing))
        ->assertRedirect(route('listings.index', absolute: false));

    expect(VehicleListing::query()->find($listing->id))->toBeNull();
});

test('users cannot delete another users listing', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $listing = VehicleListing::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)
        ->delete(route('listings.destroy', $listing))
        ->assertForbidden();
});

test('users cannot edit another users listing', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $listing = VehicleListing::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)
        ->get(route('listings.edit', $listing))
        ->assertForbidden();
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
        'body_type' => 'Truck',
        'city' => 'Austin',
        'state' => 'TX',
        'zip_code' => '78701',
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
