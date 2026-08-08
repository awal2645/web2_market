<?php

namespace App\Support;

use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use Illuminate\Support\Facades\Storage;
use Throwable;

class OpenGraphImage
{
    public const WIDTH = 1200;

    public const HEIGHT = 630;

    /**
     * Return a cached 1200x630 JPEG for the listing's first photo.
     */
    public function forListing(VehicleListing $listing): ?string
    {
        $listing->loadMissing('images');

        /** @var VehicleListingImage|null $image */
        $image = $listing->images->first();

        if ($image === null) {
            return null;
        }

        $cachePath = $this->cachePath($listing, $image);

        if (Storage::disk('public')->exists($cachePath)) {
            return Storage::disk('public')->path($cachePath);
        }

        $sourceBinary = $this->readSource($image);

        if ($sourceBinary === null) {
            return null;
        }

        try {
            $jpeg = $this->coverCropToJpeg($sourceBinary);
        } catch (Throwable) {
            return null;
        }

        if ($jpeg === null) {
            return null;
        }

        Storage::disk('public')->put($cachePath, $jpeg);

        return Storage::disk('public')->path($cachePath);
    }

    private function cachePath(VehicleListing $listing, VehicleListingImage $image): string
    {
        $fingerprint = md5(implode('|', [
            (string) $image->id,
            (string) $image->path,
            (string) ($image->updated_at ?? $image->created_at ?? ''),
        ]));

        return "og-cache/{$listing->id}-{$fingerprint}.jpg";
    }

    private function readSource(VehicleListingImage $image): ?string
    {
        $path = $image->path;

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            try {
                $contents = @file_get_contents($path);

                return is_string($contents) && $contents !== '' ? $contents : null;
            } catch (Throwable) {
                return null;
            }
        }

        $relative = ltrim($path, '/');

        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }

        if (! Storage::disk('public')->exists($relative)) {
            return null;
        }

        $contents = Storage::disk('public')->get($relative);

        return is_string($contents) && $contents !== '' ? $contents : null;
    }

    private function coverCropToJpeg(string $binary): ?string
    {
        $source = @imagecreatefromstring($binary);

        if ($source === false) {
            return null;
        }

        $srcW = imagesx($source);
        $srcH = imagesy($source);

        if ($srcW < 1 || $srcH < 1) {
            imagedestroy($source);

            return null;
        }

        $targetW = self::WIDTH;
        $targetH = self::HEIGHT;
        $scale = max($targetW / $srcW, $targetH / $srcH);
        $cropW = (int) round($targetW / $scale);
        $cropH = (int) round($targetH / $scale);
        $srcX = (int) max(0, ($srcW - $cropW) / 2);
        $srcY = (int) max(0, ($srcH - $cropH) / 2);

        $canvas = imagecreatetruecolor($targetW, $targetH);
        imagecopyresampled(
            $canvas,
            $source,
            0,
            0,
            $srcX,
            $srcY,
            $targetW,
            $targetH,
            $cropW,
            $cropH,
        );

        ob_start();
        imagejpeg($canvas, null, 82);
        $jpeg = ob_get_clean();

        imagedestroy($source);
        imagedestroy($canvas);

        return is_string($jpeg) && $jpeg !== '' ? $jpeg : null;
    }
}
