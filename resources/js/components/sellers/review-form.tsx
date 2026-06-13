import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { StarRatingInput } from '@/components/sellers/star-rating';
import { Button } from '@/components/ui/button';

type Props = {
    sellerId: string;
    disabled?: boolean;
    variant?: 'sidebar' | 'inline';
};

export function ReviewForm({
    sellerId,
    disabled = false,
    variant = 'sidebar',
}: Props) {
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (rating === 0) {
            toast.error('Tap a star to rate this seller.');
            return;
        }

        setSubmitting(true);

        router.post(
            `/sellers/${sellerId}/reviews`,
            {
                rating,
                ...(body.trim() ? { body: body.trim() } : {}),
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const message =
                        errors.rating ||
                        errors.body ||
                        Object.values(errors)[0] ||
                        'Could not submit review.';
                    toast.error(message);
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const isInline = variant === 'inline';

    return (
        <form onSubmit={handleSubmit} className={isInline ? 'space-y-4' : 'overflow-hidden rounded-2xl border border-border bg-card shadow-sm'}>
            {!isInline && (
                <div className="border-b border-border px-6 py-4">
                    <h3 className="font-semibold text-foreground">
                        Write a review
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Share your experience with this seller.
                    </p>
                </div>
            )}

            <div className={isInline ? 'space-y-4' : 'space-y-4 p-6'}>
                <div>
                    <StarRatingInput
                        value={rating}
                        onChange={setRating}
                        disabled={disabled || submitting}
                        size="lg"
                    />
                </div>

                <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Optional — tell others about your experience…"
                    rows={3}
                    disabled={disabled || submitting}
                    maxLength={2000}
                    className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20"
                />

                <Button
                    type="submit"
                    className="bg-[#1565C0] hover:bg-[#0D47A1]"
                    disabled={disabled || submitting || rating === 0}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Sending…
                        </>
                    ) : (
                        'Post review'
                    )}
                </Button>
            </div>
        </form>
    );
}
