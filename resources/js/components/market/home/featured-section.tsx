import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import {
    DummyAdBanner,
    HomeListingCard,
} from '@/components/market/home/listing-card';
import type { DisplayListing } from '@/data/homepage';

type Props = {
    listings: DisplayListing[];
    listHref: string;
    usingSavedListings?: boolean;
};

export function FeaturedSection({
    listings,
    listHref,
    usingSavedListings = false,
}: Props) {
    return (
        <section id="vehicles" className="bg-gray-50 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                            Featured Listings
                        </h2>
                        <p className="mt-1 text-gray-500">
                            {usingSavedListings
                                ? 'Latest vehicles listed on Web2Autos Market'
                                : 'Top picks from private sellers & dealers'}
                        </p>
                    </div>
                    <Link
                        href="/browse"
                        className="hidden items-center gap-1 text-sm font-semibold text-[#1565C0] hover:underline sm:inline-flex"
                    >
                        View all
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Columns 1 & 2 — car cards */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
                        {listings.slice(0, 4).map((listing) => (
                            <HomeListingCard
                                key={listing.id}
                                listing={listing}
                            />
                        ))}
                    </div>

                    {/* Column 3 — dummy ad only */}
                    <DummyAdBanner />
                </div>
            </div>
        </section>
    );
}
