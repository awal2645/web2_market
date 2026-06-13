import { Link, usePage } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useUnreadMessageCount } from '@/hooks/use-unread-message-count';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';
import type { BroadcastingConfig } from '@/lib/echo';

type SharedProps = {
    auth: Auth;
    unreadMessagesCount?: number;
    broadcasting?: BroadcastingConfig;
};

type Props = {
    className?: string;
    iconClassName?: string;
    variant?: 'default' | 'ghost';
};

export function MessageNavIcon({
    className,
    iconClassName,
    variant = 'default',
}: Props) {
    const { auth, unreadMessagesCount = 0, broadcasting } =
        usePage<SharedProps>().props;
    const count = useUnreadMessageCount(
        unreadMessagesCount,
        !!auth.user,
        broadcasting,
    );
    const displayCount = count > 99 ? '99+' : count.toString();

    if (!auth.user) {
        return null;
    }

    return (
        <Link
            href="/messages"
            className={cn(
                'relative inline-flex items-center justify-center rounded-md transition',
                variant === 'ghost'
                    ? 'size-9 text-muted-foreground hover:bg-accent hover:text-foreground'
                    : 'gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-[#1565C0]',
                className,
            )}
            aria-label={
                count > 0
                    ? `Messages, ${count} unread`
                    : 'Messages'
            }
        >
            <MessageSquare className={cn('size-4', iconClassName)} />
            {variant === 'default' && (
                <span className="hidden sm:inline">Messages</span>
            )}
            {count > 0 && (
                <span
                    className={cn(
                        'absolute flex items-center justify-center rounded-full bg-[#1565C0] font-semibold text-white',
                        variant === 'ghost'
                            ? '-top-0.5 -right-0.5 size-4 text-[10px]'
                            : '-top-1 -right-1 size-5 text-[11px]',
                    )}
                >
                    {displayCount}
                </span>
            )}
        </Link>
    );
}
