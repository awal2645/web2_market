import { useEffect, useState } from 'react';
import {
    getEcho,
    isPusherConfigured,
    leaveEchoChannel,
    type BroadcastingConfig,
} from '@/lib/echo';

const POLL_INTERVAL_MS = 15_000;

export function useUnreadMessageCount(
    initialCount = 0,
    enabled = true,
    broadcasting?: BroadcastingConfig,
) {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        setCount(initialCount);
    }, [initialCount]);

    useEffect(() => {
        const handleManualUpdate = (event: Event) => {
            const detail = (event as CustomEvent<{ count: number }>).detail;

            if (typeof detail?.count === 'number') {
                setCount(detail.count);
            }
        };

        window.addEventListener('market:unread-updated', handleManualUpdate);

        return () => {
            window.removeEventListener(
                'market:unread-updated',
                handleManualUpdate,
            );
        };
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (isPusherConfigured(broadcasting) && broadcasting.userId) {
            const echo = getEcho(broadcasting);
            const channelName = `user.${broadcasting.userId}`;
            const channel = echo?.private(channelName);

            channel?.listen('.unread.updated', (payload: { count: number }) => {
                setCount(payload.count);
            });

            return () => {
                leaveEchoChannel(`private-${channelName}`);
            };
        }

        let active = true;

        const fetchCount = async () => {
            try {
                const response = await fetch('/messages/unread-count', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok || !active) {
                    return;
                }

                const data = (await response.json()) as { count: number };
                setCount(data.count);
            } catch {
                // Ignore polling errors silently.
            }
        };

        fetchCount();
        const interval = window.setInterval(fetchCount, POLL_INTERVAL_MS);

        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [broadcasting, enabled]);

    return count;
}
