<?php

use App\Models\User;
use App\Support\AuthSync;
use App\Support\AuthSyncToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'auth_sync.secret' => 'test-sync-secret',
        'auth_sync.web2autos_url' => 'https://www.web2autos.com',
        'auth_sync.token_ttl_seconds' => 120,
        'app.url' => 'https://market.web2autos.com',
    ]);

    URL::forceRootUrl('https://market.web2autos.com');
});

test('auth sync accepts a valid token from web2autos-next', function () {
    $user = User::factory()->create([
        'email' => 'sync@example.com',
        'listing_prompt_completed_at' => now(),
    ]);

    $token = AuthSyncToken::create($user, 'test-sync-secret', 120);

    $response = $this->get(route('auth.sync', [
        'token' => $token,
        'return' => 'https://www.web2autos.com/dashboard',
    ]));

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect('https://www.web2autos.com/dashboard');
});

test('auth sync rejects an invalid token', function () {
    $response = $this->get(route('auth.sync', [
        'token' => 'invalid.token',
        'return' => 'https://www.web2autos.com/dashboard',
    ]));

    $response->assertForbidden();
    $this->assertGuest();
});

test('login redirects through web2autos sync when configured', function () {
    $user = User::factory()->create([
        'listing_prompt_completed_at' => now(),
    ]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect();
    expect($response->headers->get('Location'))->toStartWith('https://www.web2autos.com/api/auth/sync-from-market');
});

test('partner handshake url is null when sync is disabled', function () {
    config(['auth_sync.secret' => null]);

    $user = User::factory()->create();

    expect(AuthSync::partnerHandshakeUrl($user, url('/dashboard')))->toBeNull();
});
