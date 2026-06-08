<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Str;

class AuthSync
{
    public static function enabled(): bool
    {
        $secret = config('auth_sync.secret');
        $partner = config('auth_sync.web2autos_url');

        return is_string($secret) && $secret !== '' && is_string($partner) && $partner !== '';
    }

    /**
     * Redirect through web2autos-next so it can set its session cookie, then back here.
     */
    public static function partnerHandshakeUrl(User $user, string $returnUrl): ?string
    {
        if (! self::enabled()) {
            return null;
        }

        $partnerBase = rtrim((string) config('auth_sync.web2autos_url'), '/');
        $secret = (string) config('auth_sync.secret');
        $ttl = (int) config('auth_sync.token_ttl_seconds', 120);

        $safeReturn = self::sanitizeReturnUrl($returnUrl);
        if ($safeReturn === null) {
            return null;
        }

        $token = AuthSyncToken::create($user, $secret, $ttl);

        return $partnerBase.'/api/auth/sync-from-market?'.http_build_query([
            'token' => $token,
            'return' => $safeReturn,
        ]);
    }

    public static function sanitizeReturnUrl(string $url): ?string
    {
        $url = trim($url);
        if ($url === '') {
            return null;
        }

        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            $url = url($url);
        }

        $host = parse_url($url, PHP_URL_HOST);
        if (! is_string($host) || $host === '') {
            return null;
        }

        $allowedHosts = self::allowedHosts();
        if (! in_array(Str::lower($host), $allowedHosts, true)) {
            return null;
        }

        return $url;
    }

    /**
     * @return list<string>
     */
    private static function allowedHosts(): array
    {
        $hosts = [];

        foreach ([config('app.url'), config('auth_sync.web2autos_url')] as $base) {
            if (! is_string($base) || $base === '') {
                continue;
            }

            $host = parse_url($base, PHP_URL_HOST);
            if (is_string($host) && $host !== '') {
                $hosts[] = Str::lower($host);
            }
        }

        return array_values(array_unique($hosts));
    }
}
