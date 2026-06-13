<?php

namespace App\Http\Controllers;

use App\Http\Resources\VehicleListingResource;
use App\Models\VehicleListing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrowseController extends Controller
{
    /**
     * @return array<string, mixed>
     */
    public static function filterOptions(?string $selectedMake = null): array
    {
        $baseQuery = VehicleListing::query()->activeMarketplace();

        $makes = (clone $baseQuery)
            ->distinct()
            ->orderBy('make')
            ->pluck('make')
            ->filter()
            ->values()
            ->all();

        $modelsQuery = clone $baseQuery;

        if ($selectedMake && $selectedMake !== 'Any Make') {
            $modelsQuery->where('make', $selectedMake);
        }

        $models = $modelsQuery
            ->distinct()
            ->orderBy('model')
            ->pluck('model')
            ->filter()
            ->values()
            ->all();

        $modelsByMake = VehicleListing::query()
            ->activeMarketplace()
            ->select(['make', 'model'])
            ->distinct()
            ->orderBy('make')
            ->orderBy('model')
            ->get()
            ->groupBy('make')
            ->map(fn ($rows) => $rows->pluck('model')->unique()->values()->all())
            ->all();

        $states = (clone $baseQuery)
            ->whereNotNull('state')
            ->distinct()
            ->orderBy('state')
            ->pluck('state')
            ->filter()
            ->values()
            ->all();

        $transmissions = (clone $baseQuery)
            ->distinct()
            ->orderBy('transmission')
            ->pluck('transmission')
            ->filter()
            ->values()
            ->all();

        $fuelTypes = (clone $baseQuery)
            ->distinct()
            ->orderBy('fuel_type')
            ->pluck('fuel_type')
            ->filter()
            ->values()
            ->all();

        $bodyTypes = (clone $baseQuery)
            ->whereNotNull('body_type')
            ->distinct()
            ->orderBy('body_type')
            ->pluck('body_type')
            ->filter()
            ->values()
            ->all();

        return [
            'makes' => array_merge(['Any Make'], $makes ?: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW']),
            'models' => array_merge(['Any Model'], $models ?: ['Camry', 'Accord', 'F-150', 'Silverado']),
            'modelsByMake' => $modelsByMake,
            'years' => array_merge(
                ['Any Year'],
                array_map('strval', range((int) date('Y') + 1, 1990)),
            ),
            'prices' => [
                'Any Price',
                'Under $15,000',
                '$15,000 – $25,000',
                '$25,000 – $40,000',
                'Over $40,000',
            ],
            'mileages' => [
                'Any Mileage',
                'Under 50,000',
                '50,000 – 100,000',
                '100,000 – 150,000',
                'Over 150,000',
            ],
            'states' => array_merge(['Any State'], $states),
            'transmissions' => array_merge(['Any Transmission'], $transmissions ?: ['Automatic', 'Manual', 'CVT']),
            'fuelTypes' => array_merge(['Any Fuel Type'], $fuelTypes ?: ['Gasoline', 'Hybrid', 'Electric']),
            'bodyTypes' => array_merge(['Any Body Type'], $bodyTypes ?: ['Sedan', 'SUV', 'Truck', 'Coupe']),
            'sorts' => [
                ['value' => 'newest', 'label' => 'Newest First'],
                ['value' => 'price_asc', 'label' => 'Price: Low to High'],
                ['value' => 'price_desc', 'label' => 'Price: High to Low'],
                ['value' => 'mileage_asc', 'label' => 'Lowest Mileage'],
            ],
        ];
    }

    public function __invoke(Request $request, ?string $make = null, ?string $model = null): Response
    {
        if ($make) {
            $request->merge([
                'make' => str($make)->replace('-', ' ')->title()->toString(),
            ]);
        }

        if ($model) {
            $request->merge([
                'model' => str($model)->replace('-', ' ')->title()->toString(),
            ]);
        }

        $filters = [
            'make' => $request->string('make')->toString(),
            'model' => $request->string('model')->toString(),
            'year' => $request->string('year')->toString(),
            'price' => $request->string('price')->toString(),
            'mileage' => $request->string('mileage')->toString(),
            'state' => $request->string('state')->toString(),
            'transmission' => $request->string('transmission')->toString(),
            'fuel_type' => $request->string('fuel_type')->toString(),
            'body_type' => $request->string('body_type')->toString(),
            'sort' => $request->string('sort', 'newest')->toString(),
            'q' => $request->string('q')->toString(),
        ];

        $query = VehicleListing::query()
            ->activeMarketplace()
            ->with('images');

        if ($filters['make'] && $filters['make'] !== 'Any Make') {
            $query->where('make', $filters['make']);
        }

        if ($filters['model'] && $filters['model'] !== 'Any Model') {
            $query->where('model', $filters['model']);
        }

        if ($filters['year'] && $filters['year'] !== 'Any Year') {
            $query->where('year', (int) $filters['year']);
        }

        if ($filters['state'] && $filters['state'] !== 'Any State') {
            $query->where('state', $filters['state']);
        }

        if ($filters['transmission'] && $filters['transmission'] !== 'Any Transmission') {
            $query->where('transmission', $filters['transmission']);
        }

        if ($filters['fuel_type'] && $filters['fuel_type'] !== 'Any Fuel Type') {
            $query->where('fuel_type', $filters['fuel_type']);
        }

        if ($filters['body_type'] && $filters['body_type'] !== 'Any Body Type') {
            $query->where('body_type', $filters['body_type']);
        }

        $this->applyPriceFilter($query, $filters['price']);
        $this->applyMileageFilter($query, $filters['mileage']);

        if ($filters['q']) {
            $search = $filters['q'];
            $query->where(function ($q) use ($search) {
                $q->where('make', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('trim', 'like', "%{$search}%")
                    ->orWhere('vin', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('zip_code', 'like', "%{$search}%");
            });
        }

        match ($filters['sort']) {
            'price_asc' => $query->orderBy('asking_price'),
            'price_desc' => $query->orderByDesc('asking_price'),
            'mileage_asc' => $query->orderBy('mileage'),
            default => $query->latest(),
        };

        $savedIds = $request->user()?->savedListingIds() ?? [];

        $listings = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (VehicleListing $listing) => VehicleListingResource::make(
                $listing,
                in_array($listing->id, $savedIds, true),
            ));

        return Inertia::render('market/browse', [
            'listings' => $listings,
            'filters' => $filters,
            'filterOptions' => self::filterOptions(
                $filters['make'] !== '' ? $filters['make'] : null,
            ),
        ]);
    }

    /**
     * @param  Builder<VehicleListing>  $query
     */
    private function applyPriceFilter(Builder $query, string $price): void
    {
        match ($price) {
            'Under $15,000' => $query->where('asking_price', '<', 15000),
            '$15,000 – $25,000' => $query->whereBetween('asking_price', [15000, 25000]),
            '$25,000 – $40,000' => $query->whereBetween('asking_price', [25000, 40000]),
            'Over $40,000' => $query->where('asking_price', '>', 40000),
            default => null,
        };
    }

    /**
     * @param  Builder<VehicleListing>  $query
     */
    private function applyMileageFilter(Builder $query, string $mileage): void
    {
        match ($mileage) {
            'Under 50,000' => $query->where('mileage', '<', 50000),
            '50,000 – 100,000' => $query->whereBetween('mileage', [50000, 100000]),
            '100,000 – 150,000' => $query->whereBetween('mileage', [100000, 150000]),
            'Over 150,000' => $query->where('mileage', '>', 150000),
            default => null,
        };
    }
}
