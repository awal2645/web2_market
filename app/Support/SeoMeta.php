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
     * @param  array<string, mixed>  $props
     * @param  array{
     *     title: string,
     *     documentTitle: string,
     *     description: string,
     *     image: string,
     *     url: string,
     *     type: string,
     *     siteName: string
     * }  $defaults
     * @return array{
     *     title: string,
     *     documentTitle: string,
     *     description: string,
     *     image: string,
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

        $notes = trim((string) ($listing['seller_notes'] ?? ''));
        $price = number_format((float) ($listing['asking_price'] ?? 0));
        $mileage = number_format((int) ($listing['mileage'] ?? 0));
        $description = $notes !== ''
            ? $notes
            : "{$title} for \${$price} with {$mileage} miles.";

        $images = is_array($listing['images'] ?? null) ? $listing['images'] : [];
        $firstImage = is_array($images[0] ?? null) ? ($images[0]['url'] ?? null) : null;
        $image = is_string($firstImage) && $firstImage !== ''
            ? self::absoluteUrl($appUrl, $firstImage)
            : $defaults['image'];

        $slug = (string) ($listing['slug'] ?? '');
        $path = $slug !== '' ? "/market/{$slug}" : ($defaults['url']);

        return [
            'title' => $title,
            'documentTitle' => "{$title} - {$siteName}",
            'description' => self::truncate($description),
            'image' => $image,
            'url' => self::absoluteUrl($appUrl, is_string($path) ? $path : '/'),
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
     *     url: string,
     *     type: string,
     *     siteName: string
     * }  $defaults
     * @return array{
     *     title: string,
     *     documentTitle: string,
     *     description: string,
     *     image: string,
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
        $description = "{$name} on Web2Autos — {$count} active vehicle listing".($count === 1 ? '' : 's').'.';
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
