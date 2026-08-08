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

    public const VERSION = '2';

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
            $jpeg = $this->coverCropToJpeg($sourceBinary, $listing);
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
            self::VERSION,
            (string) $image->id,
            (string) $image->path,
            (string) ($image->updated_at ?? $image->created_at ?? ''),
            $listing->title(),
            (string) $listing->asking_price,
        ]));

        return 'og-cache/'.$listing->id.'-'.$fingerprint.'.jpg';
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

    private function coverCropToJpeg(string $binary, VehicleListing $listing): ?string
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

        $this->drawListingOverlay($canvas, $listing);

        ob_start();
        imagejpeg($canvas, null, 82);
        $jpeg = ob_get_clean();

        imagedestroy($source);
        imagedestroy($canvas);

        return is_string($jpeg) && $jpeg !== '' ? $jpeg : null;
    }

    /**
     * @param  \GdImage  $canvas
     */
    private function drawListingOverlay($canvas, VehicleListing $listing): void
    {
        $width = self::WIDTH;
        $height = self::HEIGHT;
        $bandTop = (int) ($height * 0.68);

        for ($y = $bandTop; $y < $height; $y++) {
            $progress = ($y - $bandTop) / max(1, $height - $bandTop);
            $alpha = (int) min(110, 20 + ($progress * 95));
            $color = imagecolorallocatealpha($canvas, 8, 18, 36, $alpha);
            imageline($canvas, 0, $y, $width, $y, $color);
        }

        $title = $listing->title();
        $price = '$'.number_format((float) $listing->asking_price);
        $cta = 'View on Web2Autos';
        $font = $this->fontPath();
        $white = imagecolorallocate($canvas, 255, 255, 255);
        $muted = imagecolorallocate($canvas, 210, 220, 235);

        if ($font !== null) {
            $titleSize = 42;
            $priceSize = 34;
            $ctaSize = 24;
            $maxTitleWidth = $width - 96;

            while ($titleSize > 28) {
                $box = imagettfbbox($titleSize, 0, $font, $title);
                $textWidth = abs(($box[2] ?? 0) - ($box[0] ?? 0));
                if ($textWidth <= $maxTitleWidth) {
                    break;
                }
                $titleSize -= 2;
            }

            imagettftext($canvas, $titleSize, 0, 48, $height - 118, $white, $font, $title);
            imagettftext($canvas, $priceSize, 0, 48, $height - 68, $white, $font, $price);
            imagettftext($canvas, $ctaSize, 0, 48, $height - 28, $muted, $font, $cta);

            return;
        }

        imagestring($canvas, 5, 48, $height - 90, substr($title, 0, 48), $white);
        imagestring($canvas, 5, 48, $height - 60, $price, $white);
        imagestring($canvas, 4, 48, $height - 32, $cta, $muted);
    }

    private function fontPath(): ?string
    {
        $candidates = [
            resource_path('fonts/OpenSans-Bold.ttf'),
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        ];

        foreach ($candidates as $candidate) {
            if (is_string($candidate) && is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}
