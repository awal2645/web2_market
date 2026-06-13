import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    rating: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const sizeClasses = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-5',
};

export function StarRatingDisplay({
    rating,
    max = 5,
    size = 'md',
    className,
}: Props) {
    const iconSize = sizeClasses[size];

    return (
        <div
            className={cn('flex items-center gap-0.5', className)}
            aria-label={`${rating} out of ${max} stars`}
        >
            {Array.from({ length: max }, (_, index) => {
                const starValue = index + 1;
                const filled = rating >= starValue - 0.25;
                const half = !filled && rating >= starValue - 0.75;

                return (
                    <Star
                        key={starValue}
                        className={cn(
                            iconSize,
                            filled || half
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-muted text-muted-foreground/30',
                        )}
                    />
                );
            })}
        </div>
    );
}

type InputProps = {
    value: number;
    onChange: (rating: number) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export function StarRatingInput({
    value,
    onChange,
    disabled = false,
    size = 'lg',
    className,
}: InputProps) {
    const iconSize = sizeClasses[size];

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1;

                return (
                    <button
                        key={starValue}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(starValue)}
                        className="rounded p-0.5 transition hover:scale-110 disabled:opacity-50"
                        aria-label={`Rate ${starValue} stars`}
                    >
                        <Star
                            className={cn(
                                iconSize,
                                starValue <= value
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-muted text-muted-foreground/30',
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
