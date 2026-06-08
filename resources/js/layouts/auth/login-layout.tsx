import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function LoginLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh">
            {/* Left — login form */}
            <div className="flex w-full flex-col justify-center bg-background px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    <Link
                        href={home()}
                        className="mb-10 inline-block transition hover:opacity-90"
                    >
                        <img
                            src="/images/web2autos-logo.png"
                            alt="Web2Autos.com"
                            className="h-11 w-auto"
                        />
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}

                    <p className="mt-10 text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Web2Autos.com
                    </p>
                </div>
            </div>

            {/* Right — promo panel */}
            <div className="relative hidden overflow-hidden bg-muted/50 lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:border-l lg:border-border lg:p-12 xl:p-16">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#1565C0]/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-muted/60 blur-3xl" />

                <div className="relative z-10 flex w-full max-w-md flex-col">
                    <img
                        src="/images/red-sports-car.png"
                        alt="Red sports car"
                        className="w-full object-contain drop-shadow-lg"
                    />

                    <div className="mt-10">
                        <p className="text-xs font-semibold tracking-widest text-[#1565C0] uppercase">
                            Web2Autos Market
                        </p>
                        <h2 className="mt-2 text-2xl leading-snug font-bold tracking-tight text-foreground xl:text-3xl">
                            Buy. Sell. Finance.
                            <br />
                            All in One Place.
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Join thousands of buyers and sellers. List your
                            car, find great deals, and get financed on one
                            trusted platform.
                        </p>
                    </div>

                    <ul className="mt-8 space-y-3.5 border-t border-border pt-8">
                        {[
                            '25,000+ vehicles listed nationwide',
                            'Sell for more than trade-in value',
                            'Auto loan pre-approval in minutes',
                        ].map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-3 text-sm text-foreground"
                            >
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1565C0]/10 text-xs font-bold text-[#1565C0]">
                                    ✓
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
