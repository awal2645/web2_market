import { HomeFooter } from '@/components/market/home/footer';
import { HomeHeader } from '@/components/market/home/header-hero';
import { MobileBottomNav } from '@/components/market/home/mobile-bottom-nav';
import type { Auth } from '@/types';

type Props = {
    auth: Auth;
    listHref: string;
    children: React.ReactNode;
    className?: string;
};

export function MarketShell({
    auth,
    listHref,
    children,
    className,
}: Props) {
    return (
        <div
            className={`flex min-h-screen flex-col bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 ${className ?? ''}`}
        >
            <HomeHeader auth={auth} listHref={listHref} />
            {children}
            <div className="mt-auto hidden md:block">
                <HomeFooter />
            </div>
            <MobileBottomNav auth={auth} listHref={listHref} />
        </div>
    );
}
