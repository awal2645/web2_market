import { useEffect, useState } from 'react';

const POLL_INTERVAL_MS = 15_000;

export function useUnreadMessageCount(initialCount = 0, enabled = true) {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        setCount(initialCount);
    }, [initialCount]);

    useEffect(() => {
        if (!enabled) {
            return;
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
    }, [enabled]);

    return count;
}
