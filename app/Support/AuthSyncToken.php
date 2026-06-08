<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Str;

class AuthSyncToken
{
    /**
     * @return array{sub: string, email: string, name: ?string, exp: int}|null
     */
    public static function create(User $user, string $secret, int $ttlSeconds): string
    {
        $payload = [
            'sub' => $user->getKey(),
            'email' => Str::lower($user->email),
            'name' => $user->name,
            'exp' => time() + $ttlSeconds,
        ];

        $encoded = self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));
        $signature = hash_hmac('sha256', $encoded, $secret);

        return $encoded.'.'.$signature;
    }

    /**
     * @return array{sub: string, email: string, name: ?string, exp: int}|null
     */
    public static function verify(string $token, string $secret): ?array
    {
        $parts = explode('.', $token, 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$encoded, $signature] = $parts;

        if (! hash_equals(hash_hmac('sha256', $encoded, $secret), $signature)) {
            return null;
        }

        try {
            $payload = json_decode(self::base64UrlDecode($encoded), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return null;
        }

        if (
            ! is_array($payload)
            || ! isset($payload['sub'], $payload['email'], $payload['exp'])
            || ! is_string($payload['sub'])
            || ! is_string($payload['email'])
            || ! is_int($payload['exp'])
            || $payload['exp'] < time()
        ) {
            return null;
        }

        return [
            'sub' => $payload['sub'],
            'email' => Str::lower($payload['email']),
            'name' => isset($payload['name']) && is_string($payload['name']) ? $payload['name'] : null,
            'exp' => $payload['exp'],
        ];
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(strtr($value, '-_', '+/'), true) ?: '';
    }
}
