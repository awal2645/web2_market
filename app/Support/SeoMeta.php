<?php

namespace App\Support;

class SeoMeta
{
    /**
     * Resolve crawler-visible SEO tags from the Inertia page payload.
     *
     * @param  array<string, mixed>  $page
     * @return array{
     *     title: string,
     *     documentTitle: string,
     *     description: string,
     *     image: string,
     *     imageWidth: int,
     *     imageHeight: int,
     *     url: string,
     *     type: string,
     *     siteName: string
     * }
     */
    public static function fromInertiaPage(array $page): array
    {
        $appUrl = rtrim((string) config('app.url'), '/');
        $siteName = (string) config('seo.site_name', config('app.name'));
        $path = (string) ($page['url'] ?? '/');
        $defaults = [
            'title' => $siteName,
            'documentTitle' => $siteName,
            'description' => self::truncate((string) config('seo.default_description')),
            'image' => self::absoluteUrl($appUrl, (string) config('seo.default_image')),
            'imageWidth' => OpenGraphImage::WIDTH,
            'imageHeight' => OpenGraphImage::HEIGHT,
            'url' => self::absoluteUrl($appUrl, $path),
            'type' => 'website',
            'siteName' => $siteName,
        ];

        $props = is_array($page['props'] ?? null) ? $page['props'] : [];

        return match ($page['component'] ?? null) {
            'listings/show' => self::forListing($props, $defaults, $appUrl, $siteName),
            'sellers/show' => self::forSeller($props, $defaults, $appUrl, $siteName),
            default => $defaults,
        };
    }

    /**
     * Build a share/search description that stays in the useful length range.
     *
     * @param  array<string, mixed>  $listing
     */
    public static function listingDescription(array $listing): string
    {
        $title = trim((string) ($listing['title'] ?? 'Vehicle'));
        $price = number_format((float) ($listing['asking_price'] ?? 0));
        $mileage = number_format((int) ($listing['mileage'] ?? 0));
        $location = trim(implode(', ', array_filter([
            trim((string) ($listing['city'] ?? '')),
            trim((string) ($listing['state'] ?? '')),
        ])));
        $notes = trim((string) ($listing['seller_notes'] ?? ''));

        $summary = "{$title} for \${$price} with {$mileage} miles";
        if ($location !== '') {
            $summary .= " in {$location}";
        }
        $summary .= '.';

        if ($notes !== '') {
            $summary .= ' '.$notes;
        }

        return self::truncate($summary, 120);
    }

    /**
     * @param  array<string, mixed>  $props
     * @param  array{
     *     title: string,
     *     documentTitle: string,
     *     description: string,
     *     image: string,
     *     imageWidth: int,
     *     imageHeight: int,
     *     url: string,
     *     type: string,
     *     siteName: string
     * }  $defaults
     * @return array{
     *     title: string,
     *     documentTitle: string,
     *     description: string,
     *     image: string,
     *     imageWidth: int,
     *     imageHeight: int,
     *     url: string,
     *     type: string,
     *     siteName: string
     * }
     */
    private static function forListing(array $props, array $defaults, string $appUrl, string $siteName): array
    {
        $listing = is_array($props['listing'] ?? null) ? $props['listing'] : null;

        if ($listing === null) {
            return $defaults;
        }

        $title = trim((string) ($listing['title'] ?? ''));
        if ($title === '') {
            $title = $defaults['title'];
        }

        $slug = (string) ($listing['slug'] ?? '');
        $path = $slug !== '' ? "/market/{$slug}" : '/';
        $hasImages = is_array($listing['images'] ?? null) && ($listing['images'][0]['url'] ?? null);

        return [
            'title' => $title,
            'documentTitle' => "{$title} - {$siteName}",
            'description' => self::listingDescription($listing),
            'image' => $slug !== '' && $hasImages
                ? self::absoluteUrl($appUrl, '/market/'.$slug.'/og.jpg?v='.OpenGraphImage::VERSION)
                : $defaults['image'],
            'imageWidth' => OpenGraphImage::WIDTH,
            'imageHeight' => OpenGraphImage::HEIGHT,
            'url' => self::absoluteUrl($appUrl, $path),
            'type' => 'product',
            'siteName' => $siteName,
        ];
    }

    /**
     * @param  array<string, mixed>  $props
     * @param  array{
     *     title: string,
     *     documentTitle: string,
     *     description: string,
     *     image: string,
     *     imageWidth: int,
     *     imageHeight: int,
     *     url: string,
     *     type: string,
     *     siteName: string
     * }  $defaults
     * @return array{
     *     title: string,
     *     documentTitle: string,
     *     description: string,
     *     image: string,
     *     imageWidth: int,
     *     imageHeight: int,
     *     url: string,
     *     type: string,
     *     siteName: string
     * }
     */
    private static function forSeller(array $props, array $defaults, string $appUrl, string $siteName): array
    {
        $seller = is_array($props['seller'] ?? null) ? $props['seller'] : null;

        if ($seller === null) {
            return $defaults;
        }

        $name = trim((string) ($seller['name'] ?? 'Seller'));
        $title = "{$name} — Seller";
        $count = (int) ($seller['active_listing_count'] ?? 0);
        $description = "{$name} on Web2Autos — {$count} active vehicle listing".($count === 1 ? '' : 's').'. Browse their cars, trucks, and SUVs on Web2Autos Market.';
        $avatar = $seller['avatar'] ?? null;
        $image = is_string($avatar) && $avatar !== ''
            ? self::absoluteUrl($appUrl, $avatar)
            : $defaults['image'];
        $slug = (string) ($seller['slug'] ?? '');

        return [
            'title' => $title,
            'documentTitle' => "{$title} - {$siteName}",
            'description' => self::truncate($description),
            'image' => $image,
            'imageWidth' => $defaults['imageWidth'],
            'imageHeight' => $defaults['imageHeight'],
            'url' => self::absoluteUrl($appUrl, $slug !== '' ? "/sellers/{$slug}" : '/'),
            'type' => 'profile',
            'siteName' => $siteName,
        ];
    }

    private static function absoluteUrl(string $appUrl, string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return $appUrl.(str_starts_with($path, '/') ? $path : '/'.$path);
    }

    private static function truncate(string $text, int $maxLength = 160): string
    {
        $normalized = trim(preg_replace('/\s+/', ' ', $text) ?? $text);

        if (mb_strlen($normalized) <= $maxLength) {
            return $normalized;
        }

        return rtrim(mb_substr($normalized, 0, $maxLength - 1)).'…';
    }
}
