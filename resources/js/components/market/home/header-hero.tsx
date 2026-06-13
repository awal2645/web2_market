import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    Heart,
    Landmark,
    Plus,
    Search,
    User,
} from 'lucide-react';
import { MessageNavIcon } from '@/components/message-nav-icon';
import { MobileHeaderActions } from '@/components/market/home/mobile-menu-sheet';
import { heroStats } from '@/data/homepage';
import { login } from '@/routes';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';

type Props = {
    auth: Auth;
    listHref: string;
};

const navLinks = [
    { label: 'Buy Cars', href: '#vehicles' },
    { label: 'Auto Loans', href: '#finance' },
    { label: 'Loan Calculator', href: '#finance' },
    { label: 'Dealers', href: '#vehicles' },
    { label: 'Resources', href: '#', hasDropdown: true },
];

export function HomeHeader({ auth, listHref }: Props) {
    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 lg:px-6">
                <Link href="/" className="shrink-0 transition hover:opacity-90">
                    <img
                        src="/images/web2autos-logo.png"
                        alt="Web2Autos.com"
                        className="h-9 w-auto sm:h-11"
                    />
                </Link>

                <nav className="hidden items-center gap-1 xl:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="inline-flex items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium text-foreground transition hover:bg-blue-50 hover:text-[#1565C0] dark:hover:bg-blue-950/40 dark:hover:text-[#90caf9]"
                        >
                            {link.label}
                            {link.hasDropdown && (
                                <ChevronDown className="size-3.5 opacity-60" />
                            )}
                        </a>
                    ))}
                </nav>

                {/* Desktop actions */}
                <div className="hidden items-center gap-2 md:flex sm:gap-3">
                    <button
                        type="button"
                        className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#1565C0] lg:inline-flex"
                    >
                        <Heart className="size-4" />
                        Saved
                    </button>

                    <MessageNavIcon />

                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:text-[#1565C0]"
                        >
                            <User className="size-4" />
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={login()}
                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:text-[#1565C0]"
                        >
                            <User className="size-4" />
                            Sign In
                        </Link>
                    )}

                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1565C0] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D47A1]"
                    >
                        <Plus className="size-4" />
                        Post Your Car
                    </Link>
                </div>

                {/* Mobile header icons */}
                <MobileHeaderActions auth={auth} />
            </div>
        </header>
    );
}

export function HomeHero({ listHref }: { listHref: string }) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-background to-background pb-0 dark:from-blue-950/30 dark:via-background dark:to-background">
            <div className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
                <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
                    <div>
                        <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                            Buy. Sell. Finance.{' '}
                            <span className="text-[#1565C0]">
                                All in One Place.
                            </span>
                        </h1>
                        <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
                            Where serious buyers meet trusted sellers and get
                            the auto loan you deserve.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                            <Link
                                href="/browse"
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1565C0] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0D47A1] sm:flex-none sm:px-5"
                            >
                                <Search className="size-4" />
                                Browse Cars
                            </Link>
                            <Link
                                href={listHref}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-[#1565C0] hover:text-[#1565C0] sm:flex-none sm:px-5 dark:hover:border-[#90caf9] dark:hover:text-[#90caf9]"
                            >
                                Sell Your Car
                            </Link>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            {heroStats.map((s) => (
                                <div
                                    key={s.label}
                                    className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-center shadow-sm dark:border-blue-800 dark:bg-blue-950/40"
                                >
                                    <p className="text-sm font-extrabold text-[#1565C0] sm:text-lg">
                                        {s.value}
                                    </p>
                                    <p className="mt-0.5 text-[10px] leading-tight font-medium text-muted-foreground sm:text-xs">
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center lg:justify-end">
                        <img
                            src="/images/red-sports-car.png"
                            alt="Sports car on Web2Autos"
                            className="w-full max-w-xs object-contain drop-shadow-xl sm:max-w-lg lg:max-w-none"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
