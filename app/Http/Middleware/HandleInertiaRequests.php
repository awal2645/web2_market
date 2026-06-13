<?php

namespace App\Http\Middleware;

use App\Support\Broadcasting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'is_admin' => $user->isAdmin(),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadMessagesCount' => $user ? $user->unreadMessagesCount() : 0,
            'savedListingIds' => $user ? $user->savedListingIds() : [],
            'compareListingIds' => array_map(
                'intval',
                $request->session()->get('compare_listing_ids', []),
            ),
            'messagePollSeconds' => (int) config('market.message_poll_seconds', 5),
            'broadcasting' => Broadcasting::clientConfig($user?->id),
            'seo' => [
                'appUrl' => rtrim(config('app.url'), '/'),
                'siteName' => config('seo.site_name'),
                'defaultDescription' => config('seo.default_description'),
                'defaultImage' => config('seo.default_image'),
                'twitterHandle' => config('seo.twitter_handle'),
            ],
        ];
    }
}
