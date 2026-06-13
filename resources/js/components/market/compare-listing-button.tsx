import { router } from '@inertiajs/react';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    listingId: number;
    className?: string;
};

export function CompareListingButton({ listingId, className }: Props) {
    return (
        <button
            type="button"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                router.post(
                    `/compare/${listingId}`,
                    {},
                    { preserveScroll: true },
                );
            }}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted',
                className,
            )}
        >
            <Scale className="size-4" />
            Compare
        </button>
    );
}
