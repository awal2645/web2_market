import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export type BroadcastingConfig = {
    enabled: boolean;
    key: string | null;
    cluster: string | null;
    scheme: string;
    userId?: string | null;
};

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo?: Echo<'pusher'>;
    }
}

function csrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

export function isPusherConfigured(
    config?: BroadcastingConfig,
): config is BroadcastingConfig & { key: string; cluster: string } {
    return Boolean(config?.enabled && config.key && config.cluster);
}

export function getEcho(config: BroadcastingConfig): Echo<'pusher'> | null {
    if (!isPusherConfigured(config)) {
        return null;
    }

    if (!window.Echo) {
        window.Pusher = Pusher;
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: config.key,
            cluster: config.cluster,
            forceTLS: config.scheme === 'https',
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    'X-CSRF-TOKEN': csrfToken(),
                },
            },
        });
    }

    return window.Echo;
}

export function leaveEchoChannel(channelName: string): void {
    window.Echo?.leave(channelName);
}
