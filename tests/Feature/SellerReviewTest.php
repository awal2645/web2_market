<?php

use App\Models\Conversation;
use App\Models\SellerReview;
use App\Models\User;
use App\Models\VehicleListing;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('seller profile page can be viewed publicly', function () {
    $seller = User::factory()->create(['name' => 'Jane Seller']);
    VehicleListing::factory()->approved()->create(['user_id' => $seller->id]);

    $response = $this->get(route('sellers.show', $seller));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('sellers/show')
        ->where('seller.name', 'Jane Seller')
        ->has('listings.data', 1)
        ->where('canReview', false)
    );
});

test('seller profile paginates listings', function () {
    $seller = User::factory()->create();

    VehicleListing::factory()
        ->approved()
        ->count(12)
        ->create(['user_id' => $seller->id]);

    $response = $this->get(route('sellers.show', $seller));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('listings.data', 9)
        ->where('listings.total', 12)
        ->where('listings.last_page', 2)
    );

    $response = $this->get(route('sellers.show', ['seller' => $seller, 'page' => 2]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('listings.data', 3)
        ->where('listings.current_page', 2)
    );
});

test('seller profile shows rating summary', function () {
    $seller = User::factory()->create();
    $reviewer = User::factory()->create(['name' => 'Buyer One']);

    SellerReview::query()->create([
        'seller_id' => $seller->id,
        'reviewer_id' => $reviewer->id,
        'rating' => 5,
        'body' => 'Great seller, very responsive.',
    ]);

    $response = $this->get(route('sellers.show', $seller));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('seller.average_rating', 5)
        ->where('seller.review_count', 1)
        ->has('reviews.data', 1)
    );
});

test('buyers can review sellers after messaging them', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create(['user_id' => $seller->id]);

    Conversation::findOrCreateBetween($buyer->id, $seller->id, $listing->id);

    $response = $this->actingAs($buyer)->post(route('sellers.reviews.store', $seller), [
        'rating' => 4,
        'body' => 'Smooth transaction and honest communication.',
        'vehicle_listing_id' => $listing->id,
    ]);

    $response->assertRedirect(route('sellers.show', [
        'seller' => $seller,
        'tab' => 'reviews',
    ]));

    expect(SellerReview::query()->count())->toBe(1);
    expect(SellerReview::query()->first()->rating)->toBe(4);
});

test('users cannot review sellers without a conversation', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();

    $this->actingAs($buyer)
        ->post(route('sellers.reviews.store', $seller), [
            'rating' => 5,
            'body' => 'Great experience overall.',
        ])
        ->assertForbidden();
});

test('users cannot review themselves', function () {
    $seller = User::factory()->create();

    $this->actingAs($seller)
        ->post(route('sellers.reviews.store', $seller), [
            'rating' => 5,
        ])
        ->assertForbidden();
});

test('users cannot submit duplicate seller reviews', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();

    Conversation::findOrCreateBetween($buyer->id, $seller->id);

    SellerReview::query()->create([
        'seller_id' => $seller->id,
        'reviewer_id' => $buyer->id,
        'rating' => 5,
    ]);

    $this->actingAs($buyer)
        ->post(route('sellers.reviews.store', $seller), [
            'rating' => 3,
            'body' => 'Trying to review again.',
        ])
        ->assertSessionHasErrors('rating');
});

test('listing page includes seller rating data', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $listing = VehicleListing::factory()->approved()->create(['user_id' => $seller->id]);

    SellerReview::query()->create([
        'seller_id' => $seller->id,
        'reviewer_id' => $buyer->id,
        'rating' => 5,
        'body' => 'Excellent seller.',
    ]);

    $response = $this->get(route('listings.show', $listing));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('sellerRating.average', 5)
        ->where('sellerRating.count', 1)
        ->where('sellerProfileUrl', route('sellers.show', $seller, absolute: false))
    );
});
