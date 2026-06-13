<?php

use App\Http\Controllers\AdminListingController;
use App\Http\Controllers\AuthSyncController;
use App\Http\Controllers\BrowseController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\SellerProfileController;
use App\Http\Controllers\VehicleListingController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::get('auth/sync', AuthSyncController::class)->name('auth.sync');

Route::get('/', HomeController::class)->name('home');
Route::get('browse', BrowseController::class)->name('browse');
Route::get('market/{listing}', [VehicleListingController::class, 'show'])->name('listings.show');
Route::get('sellers/{seller}', [SellerProfileController::class, 'show'])->name('sellers.show');

Route::middleware(['auth'])->group(function () {
    Route::post('sellers/{seller}/reviews', [SellerProfileController::class, 'storeReview'])->name('sellers.reviews.store');
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('market/{listing}/message', [ConversationController::class, 'composeFromListing'])->name('listings.message');

    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('list-vehicle', [OnboardingController::class, 'listVehiclePrompt'])->name('list-vehicle');
        Route::post('skip', [OnboardingController::class, 'skipListingPrompt'])->name('skip');
        Route::get('congratulations', [OnboardingController::class, 'congratulations'])->name('congratulations');
    });

    Route::prefix('listings')->name('listings.')->group(function () {
        Route::get('/', [VehicleListingController::class, 'index'])->name('index');
        Route::get('create', [VehicleListingController::class, 'create'])->name('create');
        Route::post('/', [VehicleListingController::class, 'store'])->name('store');
        Route::get('{listing}/edit', [VehicleListingController::class, 'edit'])->name('edit');
        Route::put('{listing}', [VehicleListingController::class, 'update'])->name('update');
        Route::delete('{listing}', [VehicleListingController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('messages')->name('messages.')->group(function () {
        Route::get('/', [ConversationController::class, 'index'])->name('index');
        Route::get('unread-count', [ConversationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/', [ConversationController::class, 'store'])->name('store');
        Route::get('{conversation}', [ConversationController::class, 'show'])->name('show');
        Route::get('{conversation}/poll', [ConversationController::class, 'poll'])->name('poll');
        Route::post('{conversation}/messages', [ConversationController::class, 'sendMessage'])->name('messages.store');
        Route::patch('{conversation}/messages/{message}', [ConversationController::class, 'updateMessage'])->name('messages.update');
        Route::delete('{conversation}', [ConversationController::class, 'destroy'])->name('destroy');
        Route::delete('{conversation}/messages/{message}', [ConversationController::class, 'destroyMessage'])->name('messages.destroy');
    });

    Route::middleware(EnsureUserIsAdmin::class)->prefix('admin')->name('admin.')->group(function () {
        Route::get('listings', [AdminListingController::class, 'index'])->name('listings.index');
        Route::post('listings/{listing}/approve', [AdminListingController::class, 'approve'])->name('listings.approve');
        Route::post('listings/{listing}/reject', [AdminListingController::class, 'reject'])->name('listings.reject');
        Route::patch('settings', [AdminListingController::class, 'updateSettings'])->name('settings.update');
    });
});

require __DIR__.'/settings.php';
