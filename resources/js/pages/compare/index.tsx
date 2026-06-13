import { Link, router, usePage } from '@inertiajs/react';
import { Scale, Trash2, X } from 'lucide-react';
import { MarketShell } from '@/components/market/home/market-shell';
import { SeoHead } from '@/components/seo/seo-head';
import { Button } from '@/components/ui/button';
import { formatMileage, formatPrice } from '@/data/homepage';
import { register } from '@/routes';
import type { Auth } from '@/types';
import type { VehicleListing } from '@/types/market';

type Props = {
    listings: VehicleListing[];
    maxItems: number;
};

export default function ComparePage({ listings, maxItems }: Props) {
    const { auth, compareListingIds = [] } = usePage<{
        auth: Auth;
        compareListingIds: number[];
    }>().props;
    const listHref = auth.user ? '/listings/create' : register();

    const clearAll = () => {
        router.post('/compare/clear');
    };

    const remove = (listingId: number) => {
        router.delete(`/compare/${listingId}`, { preserveScroll: true });
    };

    return (
        <>
            <SeoHead
                title="Compare Vehicles"
                description="Compare selected vehicles side by side on Web2Autos."
                path="/compare"
            />

            <MarketShell auth={auth} listHref={listHref}>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                                Compare Vehicles
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Up to {maxItems} vehicles · {compareListingIds.length} selected
                            </p>
                        </div>
                        {listings.length > 0 && (
                            <Button variant="outline" onClick={clearAll}>
                                <Trash2 className="size-4" />
                                Clear all
                            </Button>
                        )}
                    </div>

                    {listings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-input bg-card py-16 text-center">
                            <Scale className="mx-auto mb-4 size-10 text-muted-foreground" />
                            <p className="text-lg font-semibold text-foreground">
                                No vehicles to compare
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Add vehicles from browse or listing pages.
                            </p>
                            <Link
                                href="/browse"
                                className="mt-6 inline-flex rounded-lg bg-[#1565C0] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0D47A1]"
                            >
                                Browse vehicles
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Detail
                                        </th>
                                        {listings.map((listing) => (
                                            <th
                                                key={listing.id}
                                                className="min-w-[180px] px-4 py-3 text-left font-semibold"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <Link
                                                        href={`/market/${listing.slug}`}
                                                        className="hover:text-[#1565C0]"
                                                    >
                                                        {listing.title}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            remove(listing.id)
                                                        }
                                                        className="text-muted-foreground hover:text-destructive"
                                                        aria-label="Remove from compare"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Price', (l: VehicleListing) => formatPrice(l.asking_price)],
                                        ['Year', (l: VehicleListing) => l.year],
                                        ['Mileage', (l: VehicleListing) => `${formatMileage(l.mileage)} mi`],
                                        ['Transmission', (l: VehicleListing) => l.transmission],
                                        ['Fuel', (l: VehicleListing) => l.fuel_type],
                                        ['Drivetrain', (l: VehicleListing) => l.drivetrain],
                                        ['Body', (l: VehicleListing) => l.body_type ?? '—'],
                                        ['Location', (l: VehicleListing) => l.location_label ?? '—'],
                                        ['Views', (l: VehicleListing) => l.view_count ?? 0],
                                    ].map(([label, getter]) => (
                                        <tr
                                            key={label as string}
                                            className="border-b border-border last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium text-muted-foreground">
                                                {label as string}
                                            </td>
                                            {listings.map((listing) => (
                                                <td
                                                    key={listing.id}
                                                    className="px-4 py-3 text-foreground"
                                                >
                                                    {(getter as (l: VehicleListing) => string | number)(listing)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </MarketShell>
        </>
    );
}
