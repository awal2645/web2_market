import { cn } from '@/lib/utils';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <img
            src="/images/web2autos-logo.png"
            alt="Web2Autos.com"
            className={cn('h-8 w-auto shrink-0', className)}
        />
    );
}
