import { Heart } from 'lucide-react';
import {
    estimateMonthlyPayment,
    formatMileage,
    formatPrice,
    type DisplayListing,
} from '@/data/homepage';

export function HomeListingCard({ listing }: { listing: DisplayListing }) {
    const monthly = estimateMonthlyPayment(listing.asking_price);

    return (
        <a
            href={listing.href}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:hover:border-blue-800"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                    src={listing.image}
                    alt={listing.title}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = '/images/demo-vehicles/car-1.jpg';
                    }}
                />
                <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition hover:text-[#1565C0] dark:hover:text-[#90caf9]"
                    aria-label="Save listing"
                >
                    <Heart className="size-4" />
                </button>
            </div>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-bold text-foreground group-hover:text-[#1565C0] dark:group-hover:text-[#90caf9]">
                    {listing.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {formatMileage(listing.mileage)} miles ·{' '}
                    {listing.drivetrain}
                </p>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                    <p className="text-xl font-extrabold text-[#1565C0]">
                        {formatPrice(listing.asking_price)}
                    </p>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#1565C0] dark:bg-blue-950/40 dark:text-[#90caf9]">
                        Est. {formatPrice(monthly)}/mo
                    </span>
                </div>
            </div>
        </a>
    );
}

/** Placeholder ad for column 3 — not a real service */
export function DummyAdBanner() {
    return (
        <div
            id="finance"
            className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted lg:sticky lg:top-24 lg:min-h-[480px] lg:self-start"
        >
            <div className="flex items-center justify-between border-b border-dashed border-input bg-muted/80 px-4 py-2">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Advertisement
                </span>
                <span className="text-[10px] text-muted-foreground">Demo</span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <img
                    src="/images/web2autos-logo.png"
                    alt="Web2Autos"
                    className="mb-4 h-10 w-auto opacity-90"
                />
                <p className="text-lg font-bold text-foreground">
                    Your Ad Here
                </p>
                <p className="mt-2 max-w-[200px] text-sm leading-relaxed text-muted-foreground">
                    300 × 600 banner slot — dummy placeholder for sponsors &
                    partners
                </p>
                <div className="mt-6 w-full max-w-[220px] rounded-lg bg-[#1565C0]/10 px-4 py-3 ring-1 ring-[#1565C0]/20">
                    <p className="text-xs font-semibold text-[#1565C0]">
                        Auto Loans from 4.9% APR*
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                        *Sample promo — not a real offer
                    </p>
                </div>
            </div>
        </div>
    );
}
