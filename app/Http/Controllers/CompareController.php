<?php

namespace App\Http\Controllers;

use App\Http\Resources\VehicleListingResource;
use App\Models\VehicleListing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompareController extends Controller
{
    public function index(Request $request): Response
    {
        $ids = $this->ids($request);

        $listings = VehicleListing::query()
            ->activeMarketplace()
            ->whereIn('id', $ids)
            ->with('images')
            ->get()
            ->sortBy(fn (VehicleListing $listing) => array_search($listing->id, $ids, true))
            ->values()
            ->map(fn (VehicleListing $listing) => VehicleListingResource::make($listing));

        return Inertia::render('compare/index', [
            'listings' => $listings,
            'maxItems' => (int) config('market.compare_max_items', 4),
        ]);
    }

    public function store(Request $request, VehicleListing $listing): RedirectResponse
    {
        abort_unless($listing->isApproved(), 404);

        $ids = $this->ids($request);

        if (! in_array($listing->id, $ids, true)) {
            $ids[] = $listing->id;
        }

        $max = (int) config('market.compare_max_items', 4);
        $ids = array_slice($ids, -$max);

        $request->session()->put('compare_listing_ids', $ids);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Added to compare list.',
        ]);

        return back();
    }

    public function destroy(Request $request, VehicleListing $listing): RedirectResponse
    {
        $ids = array_values(array_filter(
            $this->ids($request),
            fn (int $id) => $id !== $listing->id,
        ));

        $request->session()->put('compare_listing_ids', $ids);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        $request->session()->forget('compare_listing_ids');

        return redirect()->route('compare.index');
    }

    /**
     * @return list<int>
     */
    private function ids(Request $request): array
    {
        return array_values(array_unique(array_map(
            'intval',
            $request->session()->get('compare_listing_ids', []),
        )));
    }
}
