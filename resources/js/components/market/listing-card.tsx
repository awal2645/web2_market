import type { VehicleListing } from '@/types/market';
import { ArrowRight, Gauge } from 'lucide-react';

type ListingCardProps = {
    listing: VehicleListing;
    href: string;
    featured?: boolean;
};

export function ListingCard({
    listing,
    href,
    featured = false,
}: ListingCardProps) {
    const imageUrl = listing.images[0]?.url;
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(listing.asking_price);

    const formattedMileage = new Intl.NumberFormat('en-US').format(
        listing.mileage,
    );

    if (featured) {
        return (
            <a
                href={href}
                className="group relative col-span-full overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl lg:col-span-2 lg:row-span-2"
            >
                <div className="aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[420px]">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={listing.title}
                            className="size-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="size-full bg-neutral-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <span className="mb-3 inline-block rounded bg-[#1565C0] px-2.5 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                        Featured
                    </span>
                    <h3 className="text-2xl font-bold text-white sm:text-3xl">
                        {listing.title}
                    </h3>
                    {listing.trim && (
                        <p className="mt-1 text-white/70">{listing.trim}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                        <p className="text-3xl font-extrabold text-white">
                            {formattedPrice}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-white/80">
                            <span className="inline-flex items-center gap-1.5">
                                <Gauge className="size-4" />
                                {formattedMileage} mi
                            </span>
                            <span>{listing.exterior_color}</span>
                        </div>
                    </div>
                </div>
            </a>
        );
    }

    return (
        <a
            href={href}
            className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-border"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={listing.title}
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                        No photo
                    </div>
                )}
                <div className="absolute top-3 right-3 rounded-md bg-background/95 px-2.5 py-1 text-xs font-bold text-[#1565C0] shadow-sm dark:text-[#90caf9]">
                    {formattedPrice}
                </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-foreground group-hover:text-[#1565C0] dark:group-hover:text-[#90caf9]">
                    {listing.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {formattedMileage} mi · {listing.transmission} ·{' '}
                    {listing.exterior_color}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1565C0]">
                    View listing
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </span>
            </div>
        </a>
    );
}
