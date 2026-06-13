<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VehicleListing;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = [
            [
                'loc' => route('home'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '1.0',
            ],
            [
                'loc' => route('browse'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '0.9',
            ],
        ];

        VehicleListing::query()
            ->activeMarketplace()
            ->orderByDesc('updated_at')
            ->each(function (VehicleListing $listing) use (&$urls): void {
                $urls[] = [
                    'loc' => route('listings.show', $listing),
                    'lastmod' => ($listing->updated_at ?? $listing->created_at)?->toAtomString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.8',
                ];
            });

        User::query()
            ->whereHas('vehicleListings', fn ($query) => $query->activeMarketplace())
            ->orderBy('id')
            ->each(function (User $seller) use (&$urls): void {
                $urls[] = [
                    'loc' => route('sellers.show', $seller),
                    'lastmod' => now()->toAtomString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.6',
                ];
            });

        $content = view('sitemap', ['urls' => $urls])->render();

        return response($content, 200)->header('Content-Type', 'application/xml');
    }
}
