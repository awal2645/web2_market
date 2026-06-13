import { router, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import type { Auth } from '@/types';

type Props = {
    listingId: number;
    isSaved?: boolean;
    className?: string;
    iconClassName?: string;
};

export function SaveListingButton({
    listingId,
    isSaved = false,
    className,
    iconClassName,
}: Props) {
    const { auth, savedListingIds = [] } = usePage<{
        auth: Auth;
        savedListingIds?: number[];
    }>().props;

    const saved =
        isSaved || savedListingIds.includes(listingId);

    const toggle = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (!auth.user) {
            router.visit(login());
            return;
        }

        if (saved) {
            router.delete(`/saved-listings/${listingId}`, {
                preserveScroll: true,
            });
            return;
        }

        router.post(
            `/saved-listings/${listingId}`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <button
            type="button"
            onClick={toggle}
            className={cn(
                'flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition hover:text-[#1565C0] dark:hover:text-[#90caf9]',
                saved && 'text-red-500 hover:text-red-600',
                className,
            )}
            aria-label={saved ? 'Remove from saved listings' : 'Save listing'}
        >
            <Heart
                className={cn('size-4', saved && 'fill-current', iconClassName)}
            />
        </button>
    );
}
