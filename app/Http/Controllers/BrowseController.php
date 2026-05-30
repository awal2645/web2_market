<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Http\Resources\VehicleListingResource;
use App\Models\VehicleListing;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrowseController extends Controller
{
    /**
     * @return array<string, mixed>
     */
    public static function filterOptions(): array
    {
        $makes = VehicleListing::query()
            ->where('status', ListingStatus::Approved)
            ->distinct()
            ->orderBy('make')
            ->pluck('make')
            ->filter()
            ->values()
            ->all();

        $models = VehicleListing::query()
            ->where('status', ListingStatus::Approved)
            ->distinct()
            ->orderBy('model')
            ->pluck('model')
            ->filter()
            ->values()
            ->all();

        return [
            'makes' => array_merge(['Any Make'], $makes ?: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW']),
            'models' => array_merge(['Any Model'], $models ?: ['Camry', 'Accord', 'F-150', 'Silverado']),
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
            'sorts' => [
                ['value' => 'newest', 'label' => 'Newest First'],
                ['value' => 'price_asc', 'label' => 'Price: Low to High'],
                ['value' => 'price_desc', 'label' => 'Price: High to Low'],
                ['value' => 'mileage_asc', 'label' => 'Lowest Mileage'],
            ],
        ];
    }

    public function __invoke(Request $request): Response
    {
        $filters = [
            'make' => $request->string('make')->toString(),
            'model' => $request->string('model')->toString(),
            'year' => $request->string('year')->toString(),
            'price' => $request->string('price')->toString(),
            'sort' => $request->string('sort', 'newest')->toString(),
            'q' => $request->string('q')->toString(),
        ];

        $query = VehicleListing::query()
            ->where('status', ListingStatus::Approved)
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

        $this->applyPriceFilter($query, $filters['price']);

        if ($filters['q']) {
            $search = $filters['q'];
            $query->where(function ($q) use ($search) {
                $q->where('make', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('trim', 'like', "%{$search}%")
                    ->orWhere('vin', 'like', "%{$search}%");
            });
        }

        match ($filters['sort']) {
            'price_asc' => $query->orderBy('asking_price'),
            'price_desc' => $query->orderByDesc('asking_price'),
            'mileage_asc' => $query->orderBy('mileage'),
            default => $query->latest(),
        };

        $listings = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (VehicleListing $listing) => VehicleListingResource::make($listing));

        return Inertia::render('market/browse', [
            'listings' => $listings,
            'filters' => $filters,
            'filterOptions' => self::filterOptions(),
        ]);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<VehicleListing>  $query
     */
    private function applyPriceFilter($query, string $price): void
    {
        match ($price) {
            'Under $15,000' => $query->where('asking_price', '<', 15000),
            '$15,000 – $25,000' => $query->whereBetween('asking_price', [15000, 25000]),
            '$25,000 – $40,000' => $query->whereBetween('asking_price', [25000, 40000]),
            'Over $40,000' => $query->where('asking_price', '>', 40000),
            default => null,
        };
    }
}
