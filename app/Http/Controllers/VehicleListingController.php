<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Http\Requests\StoreVehicleListingRequest;
use App\Http\Requests\UpdateVehicleListingRequest;
use App\Http\Resources\VehicleListingResource;
use App\Mail\ListingApprovedMail;
use App\Models\Conversation;
use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use App\Services\MarketSettings;
use App\Services\SavedListingPriceAlerts;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class VehicleListingController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $filters = [
            'status' => $request->string('status', 'all')->toString(),
            'q' => $request->string('q')->toString(),
            'sort' => $request->string('sort', 'newest')->toString(),
        ];

        $query = VehicleListing::query()
            ->where('user_id', $userId)
            ->with('images');

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['q']) {
            $search = '%'.$filters['q'].'%';
            $query->where(function ($builder) use ($search) {
                $builder->where('make', 'like', $search)
                    ->orWhere('model', 'like', $search)
                    ->orWhere('trim', 'like', $search)
                    ->orWhere('vin', 'like', $search);
            });
        }

        match ($filters['sort']) {
            'price_asc' => $query->orderBy('asking_price'),
            'price_desc' => $query->orderByDesc('asking_price'),
            'oldest' => $query->oldest(),
            default => $query->latest(),
        };

        $counts = VehicleListing::query()
            ->where('user_id', $userId)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('listings/index', [
            'listings' => $query->get()
                ->map(fn (VehicleListing $listing) => VehicleListingResource::make($listing)),
            'filters' => $filters,
            'counts' => [
                'all' => $counts->sum(),
                'approved' => (int) ($counts[ListingStatus::Approved->value] ?? 0),
                'pending' => (int) ($counts[ListingStatus::Pending->value] ?? 0),
                'rejected' => (int) ($counts[ListingStatus::Rejected->value] ?? 0),
                'sold' => (int) ($counts[ListingStatus::Sold->value] ?? 0),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $createdListing = null;

        if ($request->query('step') === 'success' && $request->session()->has('created_listing_id')) {
            $listing = VehicleListing::query()
                ->where('id', $request->session()->get('created_listing_id'))
                ->where('user_id', $user->id)
                ->with('images')
                ->first();

            if ($listing) {
                $createdListing = VehicleListingResource::make($listing);
                $request->session()->forget('created_listing_id');
            }
        }

        return Inertia::render('listings/create', [
            'defaults' => [
                'contact_name' => $user->name,
                'contact_email' => $user->email,
            ],
            'options' => $this->formOptions(),
            'approvalMode' => app(MarketSettings::class)->approvalMode()->value,
            'initialStep' => $request->query('step', 'basics'),
            'createdListing' => $createdListing,
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

        $status = $marketSettings->initialListingStatus();

        if ($status === ListingStatus::Approved && $request->user()->email) {
            Mail::to($request->user()->email)->queue(new ListingApprovedMail($listing));
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $status === ListingStatus::Approved
                ? 'Your listing is live on Web2Autos Market!'
                : 'Your listing was submitted and is pending review.',
        ]);

        return redirect()
            ->route('listings.create', ['step' => 'success'])
            ->with('created_listing_id', $listing->id);
    }

    public function edit(Request $request, VehicleListing $listing): Response
    {
        abort_unless($listing->user_id === $request->user()->id, 403);

        $listing->load('images');
        $successListing = null;

        if ($request->query('step') === 'success' && $request->session()->has('updated_listing_id')) {
            $updated = VehicleListing::query()
                ->where('id', $request->session()->get('updated_listing_id'))
                ->where('user_id', $request->user()->id)
                ->with('images')
                ->first();

            if ($updated) {
                $successListing = VehicleListingResource::make($updated);
                $request->session()->forget('updated_listing_id');
            }
        }

        return Inertia::render('listings/edit', [
            'listing' => VehicleListingResource::make($listing),
            'options' => $this->formOptions(),
            'approvalMode' => app(MarketSettings::class)->approvalMode()->value,
            'initialStep' => $request->query('step', 'basics'),
            'successListing' => $successListing,
        ]);
    }

    public function update(UpdateVehicleListingRequest $request, VehicleListing $listing): RedirectResponse
    {
        abort_unless($listing->user_id === $request->user()->id, 403);

        $previousPrice = $listing->asking_price;

        $listing->update($request->safe()->except(['images', 'remove_images']));

        $removeIds = collect($request->input('remove_images', []))
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->all();

        if ($removeIds !== []) {
            $imagesToRemove = $listing->images()
                ->whereIn('id', $removeIds)
                ->get();

            foreach ($imagesToRemove as $image) {
                Storage::disk('public')->delete($image->path);
                $image->delete();
            }
        }

        $nextSortOrder = (int) $listing->images()->max('sort_order') + 1;

        foreach ($request->file('images', []) as $index => $image) {
            $path = $image->store('vehicle-listings', 'public');

            VehicleListingImage::query()->create([
                'vehicle_listing_id' => $listing->id,
                'path' => $path,
                'sort_order' => $nextSortOrder + $index,
            ]);
        }

        if ($listing->images()->count() === 0) {
            throw ValidationException::withMessages([
                'images' => 'Please keep or upload at least one photo of your vehicle.',
            ]);
        }

        if ($listing->wasChanged('asking_price')) {
            app(SavedListingPriceAlerts::class)->notifyIfPriceDropped(
                $listing->fresh(),
                $previousPrice,
            );
        }

        if ($listing->status === ListingStatus::Rejected) {
            $listing->update(['status' => ListingStatus::Pending]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Your listing has been updated.',
        ]);

        return redirect()
            ->route('listings.edit', ['listing' => $listing, 'step' => 'success'])
            ->with('updated_listing_id', $listing->id);
    }

    public function destroy(Request $request, VehicleListing $listing): RedirectResponse
    {
        abort_unless($listing->user_id === $request->user()->id, 403);

        $listing->load('images');

        foreach ($listing->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $listing->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Listing deleted.',
        ]);

        return redirect()->route('listings.index');
    }

    public function markSold(Request $request, VehicleListing $listing): RedirectResponse
    {
        abort_unless($listing->user_id === $request->user()->id, 403);
        abort_unless($listing->isApproved(), 422, 'Only live listings can be marked as sold.');

        $listing->update(['status' => ListingStatus::Sold]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Listing marked as sold.',
        ]);

        return back();
    }

    public function show(Request $request, VehicleListing $listing): Response|RedirectResponse
    {
        $routeKey = (string) $request->route()->originalParameter('listing');

        if ($routeKey !== $listing->slug) {
            return redirect()->route('listings.show', $listing, 301);
        }

        $user = $request->user();

        if (! $user || $listing->user_id !== $user->id) {
            $sessionKey = 'listing_view_'.$listing->id;

            if (! $request->session()->has($sessionKey)) {
                $listing->increment('view_count');
                $request->session()->put($sessionKey, true);
            }
        }

        abort_unless(
            $listing->isPubliclyViewable()
            || ($user && ($listing->user_id === $user->id || $user->isAdmin())),
            403,
        );

        $listing->load('images', 'user');

        $savedIds = $user?->savedListingIds() ?? [];

        $similarListings = VehicleListing::query()
            ->activeMarketplace()
            ->where('id', '!=', $listing->id)
            ->where('make', $listing->make)
            ->with('images')
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (VehicleListing $item) => VehicleListingResource::make($item));

        return Inertia::render('listings/show', [
            'listing' => VehicleListingResource::make(
                $listing,
                in_array($listing->id, $savedIds, true),
            ),
            'similarListings' => $similarListings,
            'isOwner' => $user && $listing->user_id === $user->id,
            'canMarkSold' => $user && $listing->user_id === $user->id && $listing->isApproved(),
            'messageConversation' => $user && $listing->user_id !== $user->id
                ? Conversation::summaryForListing($user, $listing)
                : null,
            'messageUrl' => route('listings.message', $listing, absolute: false),
            'sellerProfileUrl' => $listing->user
                ? route('sellers.show', $listing->user, absolute: false)
                : null,
            'sellerRating' => $listing->user
                ? SellerProfileController::ratingStats($listing->user)
                : null,
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
            'bodyTypes' => ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Convertible', 'Wagon', 'Other'],
        ];
    }
}
