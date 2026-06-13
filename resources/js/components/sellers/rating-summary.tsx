import { StarRatingDisplay } from '@/components/sellers/star-rating';

type Props = {
    averageRating: number | null;
    reviewCount: number;
    distribution: Record<number, number>;
};

export function RatingSummary({
    averageRating,
    reviewCount,
    distribution,
}: Props) {
    const maxCount = Math.max(...Object.values(distribution), 1);

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
            <div className="flex items-center gap-4 sm:min-w-[120px] sm:flex-col sm:gap-1 sm:text-center">
                <p className="text-3xl font-bold text-foreground">
                    {averageRating !== null ? averageRating.toFixed(1) : '—'}
                </p>
                <div>
                    <StarRatingDisplay
                        rating={averageRating ?? 0}
                        size="sm"
                        className="justify-center sm:justify-center"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <div className="hidden h-12 w-px bg-border sm:block" />

            <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] ?? 0;
                    const width = `${(count / maxCount) * 100}%`;

                    return (
                        <div
                            key={star}
                            className="flex items-center gap-2 text-xs"
                        >
                            <span className="w-3 text-muted-foreground">
                                {star}
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-amber-400"
                                    style={{ width }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
