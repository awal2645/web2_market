import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Heart } from 'lucide-react';
import { MarketShell } from '@/components/market/home/market-shell';
import { HomeListingCard } from '@/components/market/home/listing-card';
import { PrivatePageHead } from '@/components/seo/seo-head';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { vehicleListingToDisplay } from '@/data/homepage';
import { register } from '@/routes';
import type { Auth } from '@/types';
import type { VehicleListing } from '@/types/market';

type Props = {
    listings: VehicleListing[];
};

export default function SavedListingsPage({ listings }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : register();

    const togglePriceAlerts = (listing: VehicleListing, enabled: boolean) => {
        router.patch(
            `/saved-listings/${listing.id}/alerts`,
            { price_alerts_enabled: enabled },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <PrivatePageHead title="Saved Listings" />

            <MarketShell auth={auth} listHref={listHref}>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                            Saved Listings
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {listings.length} saved vehicle
                            {listings.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {listings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-input bg-card py-16 text-center">
                            <Heart className="mx-auto mb-4 size-10 text-muted-foreground" />
                            <p className="text-lg font-semibold text-foreground">
                                No saved listings yet
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Tap the heart on any listing to save it here.
                            </p>
                            <Link
                                href="/browse"
                                className="mt-6 inline-flex rounded-lg bg-[#1565C0] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0D47A1]"
                            >
                                Browse vehicles
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {listings.map((listing) => (
                                <div key={listing.id} className="space-y-3">
                                    <HomeListingCard
                                        listing={vehicleListingToDisplay(listing)}
                                    />
                                    <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2.5">
                                        <Checkbox
                                            id={`price-alert-${listing.id}`}
                                            checked={
                                                listing.price_alerts_enabled ??
                                                true
                                            }
                                            onCheckedChange={(checked) =>
                                                togglePriceAlerts(
                                                    listing,
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`price-alert-${listing.id}`}
                                            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground"
                                        >
                                            <Bell className="size-3.5 text-muted-foreground" />
                                            Price drop alerts
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </MarketShell>
        </>
    );
}
