import { Head, Link } from '@inertiajs/react';
import { Car, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatPrice } from '@/data/homepage';
import type { VehicleListing } from '@/types/market';

type Props = {
    listings: VehicleListing[];
};

const statusStyles: Record<string, string> = {
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    rejected: 'border-red-200 bg-red-50 text-red-700',
};

export default function MyListings({ listings }: Props) {
    return (
        <>
            <Head title="My Listings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#1565C0]">
                            Web2Autos Market
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            My Listings
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            All vehicles you have listed for sale.
                        </p>
                    </div>
                    <Button
                        className="bg-[#1565C0] hover:bg-[#0D47A1]"
                        asChild
                    >
                        <Link href="/listings/create">
                            <Plus />
                            List a Vehicle
                        </Link>
                    </Button>
                </div>

                {listings.length === 0 ? (
                    <Card className="border-dashed border-gray-300 py-12">
                        <CardContent className="flex flex-col items-center text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-blue-50">
                                <Car className="size-7 text-[#1565C0]" />
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-gray-900">
                                No listings yet
                            </h2>
                            <p className="mt-2 max-w-sm text-sm text-gray-500">
                                List your first vehicle to start reaching buyers
                                on Web2Autos Market.
                            </p>
                            <Button
                                className="mt-6 bg-[#1565C0] hover:bg-[#0D47A1]"
                                asChild
                            >
                                <Link href="/listings/create">
                                    <Plus />
                                    Create Your First Listing
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="gap-0 border-gray-200 py-0 shadow-sm">
                        <CardHeader className="border-b border-gray-100 py-5">
                            <CardTitle className="text-base">
                                {listings.length} listing
                                {listings.length !== 1 ? 's' : ''}
                            </CardTitle>
                            <CardDescription>
                                Approved listings also appear on the homepage
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {listings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                                    >
                                        <img
                                            src={
                                                listing.images[0]?.url ??
                                                '/images/demo-vehicles/car-2.jpg'
                                            }
                                            alt={listing.title}
                                            className="size-20 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {listing.title}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        statusStyles[
                                                            listing.status
                                                        ] ??
                                                        statusStyles.pending
                                                    }
                                                >
                                                    {listing.status_label}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 text-lg font-bold text-[#1565C0]">
                                                {formatPrice(
                                                    listing.asking_price,
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {listing.mileage.toLocaleString()}{' '}
                                                mi · {listing.drivetrain} ·{' '}
                                                {listing.condition}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="shrink-0 border-gray-300"
                                            asChild
                                        >
                                            <Link
                                                href={`/market/${listing.id}`}
                                            >
                                                View
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

MyListings.layout = {
    breadcrumbs: [{ title: 'My Listings', href: '/listings' }],
};
