<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Http\Requests\StoreVehicleListingRequest;
use App\Http\Resources\VehicleListingResource;
use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use App\Services\MarketSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleListingController extends Controller
{
    public function index(Request $request): Response
    {
        $listings = VehicleListing::query()
            ->where('user_id', $request->user()->id)
            ->with('images')
            ->latest()
            ->get()
            ->map(fn (VehicleListing $listing) => VehicleListingResource::make($listing));

        return Inertia::render('listings/index', [
            'listings' => $listings,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('listings/create', [
            'defaults' => [
                'contact_name' => $user->name,
                'contact_email' => $user->email,
            ],
            'options' => $this->formOptions(),
            'approvalMode' => app(MarketSettings::class)->approvalMode()->value,
        ]);
    }

    public function store(StoreVehicleListingRequest $request, MarketSettings $marketSettings): RedirectResponse
    {
        $listing = VehicleListing::query()->create([
            ...$request->safe()->except('images'),
            'user_id' => $request->user()->id,
            'status' => $marketSettings->initialListingStatus(),
        ]);

        foreach ($request->file('images', []) as $index => $image) {
            $path = $image->store('vehicle-listings', 'public');

            VehicleListingImage::query()->create([
                'vehicle_listing_id' => $listing->id,
                'path' => $path,
                'sort_order' => $index,
            ]);
        }

        $request->user()->update([
            'listing_prompt_completed_at' => now(),
        ]);

        return redirect()->route('listings.index');
    }

    public function show(Request $request, VehicleListing $listing): Response
    {
        $user = $request->user();

        abort_unless(
            $listing->isApproved()
            || ($user && ($listing->user_id === $user->id || $user->isAdmin())),
            403,
        );

        $listing->load('images');

        $similarListings = VehicleListing::query()
            ->where('status', ListingStatus::Approved)
            ->where('id', '!=', $listing->id)
            ->where('make', $listing->make)
            ->with('images')
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (VehicleListing $item) => VehicleListingResource::make($item));

        return Inertia::render('listings/show', [
            'listing' => VehicleListingResource::make($listing),
            'similarListings' => $similarListings,
            'isOwner' => $user && $listing->user_id === $user->id,
        ]);
    }

    /**
     * @return array<string, list<string>>
     */
    private function formOptions(): array
    {
        return [
            'titleStatuses' => ['Clean', 'Salvage', 'Rebuilt', 'Lien', 'Other'],
            'conditions' => ['Excellent', 'Good', 'Fair', 'Poor'],
            'transmissions' => ['Automatic', 'Manual', 'CVT', 'Other'],
            'fuelTypes' => ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid', 'Other'],
            'drivetrains' => ['FWD', 'RWD', 'AWD', '4WD'],
        ];
    }
}
