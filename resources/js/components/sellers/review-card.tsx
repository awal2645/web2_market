import { StarRatingDisplay } from '@/components/sellers/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SellerReview } from '@/types/sellers';

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function formatDate(iso: string | null): string {
    if (!iso) {
        return '';
    }

    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function ReviewCard({ review }: { review: SellerReview }) {
    return (
        <article className="rounded-xl border border-border bg-card p-4">
            <div className="flex gap-3">
                <Avatar className="size-10 shrink-0">
                    <AvatarImage src={review.reviewer_avatar ?? undefined} />
                    <AvatarFallback className="text-xs font-semibold">
                        {initials(review.reviewer_name)}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                        <p className="font-medium text-foreground">
                            {review.reviewer_name}
                        </p>
                        <time className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                        </time>
                    </div>

                    <StarRatingDisplay
                        rating={review.rating}
                        size="sm"
                        className="mt-1"
                    />

                    {review.body && (
                        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                            {review.body}
                        </p>
                    )}

                    {review.listing_title && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            About: {review.listing_title}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}
