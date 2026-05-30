<?php

use App\Http\Controllers\AdminListingController;
use App\Http\Controllers\BrowseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\VehicleListingController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('browse', BrowseController::class)->name('browse');
Route::get('market/{listing}', [VehicleListingController::class, 'show'])->name('listings.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('list-vehicle', [OnboardingController::class, 'listVehiclePrompt'])->name('list-vehicle');
        Route::post('skip', [OnboardingController::class, 'skipListingPrompt'])->name('skip');
        Route::get('congratulations', [OnboardingController::class, 'congratulations'])->name('congratulations');
    });

    Route::prefix('listings')->name('listings.')->group(function () {
        Route::get('/', [VehicleListingController::class, 'index'])->name('index');
        Route::get('create', [VehicleListingController::class, 'create'])->name('create');
        Route::post('/', [VehicleListingController::class, 'store'])->name('store');
    });

    Route::middleware(EnsureUserIsAdmin::class)->prefix('admin')->name('admin.')->group(function () {
        Route::get('listings', [AdminListingController::class, 'index'])->name('listings.index');
        Route::post('listings/{listing}/approve', [AdminListingController::class, 'approve'])->name('listings.approve');
        Route::post('listings/{listing}/reject', [AdminListingController::class, 'reject'])->name('listings.reject');
        Route::patch('settings', [AdminListingController::class, 'updateSettings'])->name('settings.update');
    });
});

require __DIR__.'/settings.php';
