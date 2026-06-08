import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function FieldLabel({
    htmlFor,
    children,
    required = false,
    className,
}: {
    htmlFor?: string;
    children: ReactNode;
    required?: boolean;
    className?: string;
}) {
    return (
        <Label htmlFor={htmlFor} className={cn(className)}>
            {children}
            {required ? (
                <span
                    className="ml-0.5 font-semibold text-destructive"
                    aria-hidden="true"
                >
                    *
                </span>
            ) : (
                <span className="ml-1 font-normal text-muted-foreground">
                    (optional)
                </span>
            )}
        </Label>
    );
}

export function RequiredFieldsNote({ className }: { className?: string }) {
    return (
        <p className={cn('text-sm text-muted-foreground', className)}>
            <span className="font-semibold text-destructive" aria-hidden="true">
                *
            </span>{' '}
            Required field
        </p>
    );
}
