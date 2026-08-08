<?php

namespace App\Http\Controllers;

use App\Models\VehicleListing;
use App\Support\OpenGraphImage;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ListingOgImageController extends Controller
{
    public function __invoke(VehicleListing $listing, OpenGraphImage $openGraphImage): BinaryFileResponse|Response
    {
        abort_unless($listing->isPubliclyViewable(), 404);

        $path = $openGraphImage->forListing($listing);

        if ($path === null) {
            $fallback = public_path(ltrim((string) config('seo.default_image'), '/'));

            abort_unless(is_file($fallback), 404);

            return response()->file($fallback, [
                'Content-Type' => 'image/jpeg',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }

        return response()->file($path, [
            'Content-Type' => 'image/jpeg',
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }
}
