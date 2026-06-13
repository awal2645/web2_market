<?php

namespace App\Support;

class Broadcasting
{
    public static function isEnabled(): bool
    {
        return config('broadcasting.default') === 'pusher'
            && filled(config('broadcasting.connections.pusher.key'));
    }

    /**
     * @return array{enabled: bool, key: string|null, cluster: string|null, scheme: string, userId: string|null}
     */
    public static function clientConfig(?string $userId = null): array
    {
        $options = config('broadcasting.connections.pusher.options', []);

        return [
            'enabled' => self::isEnabled(),
            'key' => config('broadcasting.connections.pusher.key'),
            'cluster' => $options['cluster'] ?? 'mt1',
            'scheme' => $options['scheme'] ?? 'https',
            'userId' => $userId,
        ];
    }
}
