import { Head, Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    Car,
    Fuel,
    Gauge,
    Mail,
    MapPin,
    Phone,
    Settings2,
} from 'lucide-react';
import { useState } from 'react';
import { HomeFooter } from '@/components/market/home/footer';
import { HomeHeader } from '@/components/market/home/header-hero';
import { HomeListingCard } from '@/components/market/home/listing-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    estimateMonthlyPayment,
    formatMileage,
    formatPrice,
    vehicleListingToDisplay,
} from '@/data/homepage';
import { register } from '@/routes';
import type { Auth } from '@/types';
import type { VehicleListing } from '@/types/market';

type Props = {
    listing: VehicleListing;
    similarListings: VehicleListing[];
    isOwner: boolean;
};

export default function ShowListing({
    listing,
    similarListings,
    isOwner,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : register();
    const [activeImage, setActiveImage] = useState(0);

    const images = listing.images.length
        ? listing.images
        : [{ id: 0, url: '/images/demo-vehicles/car-2.jpg' }];

    const monthly = estimateMonthlyPayment(listing.asking_price);
    const listedDate = listing.created_at
        ? new Date(listing.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : null;

    const specs = [
        { icon: Gauge, label: 'Mileage', value: `${formatMileage(listing.mileage)} mi` },
        { icon: Settings2, label: 'Transmission', value: listing.transmission },
        { icon: Fuel, label: 'Fuel Type', value: listing.fuel_type },
        { icon: Car, label: 'Drivetrain', value: listing.drivetrain },
        { icon: MapPin, label: 'Condition', value: listing.condition },
        { icon: Calendar, label: 'Title', value: listing.title_status },
    ];

    return (
        <>
            <Head title={listing.title} />

            <div className="min-h-screen bg-gray-50">
                <HomeHeader auth={auth} listHref={listHref} />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-[#1565C0]">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/browse" className="hover:text-[#1565C0]">
                            Browse
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">{listing.title}</span>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            {/* Gallery */}
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="aspect-[16/10] bg-gray-100">
                                    <img
                                        src={images[activeImage]?.url}
                                        alt={listing.title}
                                        className="size-full object-cover"
                                    />
                                </div>
                                {images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto p-3">
                                        {images.map((img, i) => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() =>
                                                    setActiveImage(i)
                                                }
                                                className={`size-16 shrink-0 overflow-hidden rounded-lg ring-2 ${
                                                    i === activeImage
                                                        ? 'ring-[#1565C0]'
                                                        : 'ring-transparent'
                                                }`}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Title block mobile */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:hidden">
                                <TitleBlock
                                    listing={listing}
                                    monthly={monthly}
                                    listedDate={listedDate}
                                    isOwner={isOwner}
                                />
                            </div>

                            {/* Seller notes */}
                            {listing.seller_notes && (
                                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Seller Description
                                    </h2>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                                        {listing.seller_notes}
                                    </p>
                                </section>
                            )}

                            {/* Quick specs */}
                            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Key Specs
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {specs.map(({ icon: Icon, label, value }) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
                                        >
                                            <Icon className="size-5 shrink-0 text-[#1565C0]" />
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    {label}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Full details */}
                            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Full Vehicle Details
                                </h2>
                                <dl className="grid gap-4 sm:grid-cols-2">
                                    <Detail label="Year" value={listing.year} />
                                    <Detail label="Make" value={listing.make} />
                                    <Detail label="Model" value={listing.model} />
                                    {listing.trim && (
                                        <Detail label="Trim" value={listing.trim} />
                                    )}
                                    <Detail label="VIN" value={listing.vin} />
                                    <Detail
                                        label="Exterior Color"
                                        value={listing.exterior_color}
                                    />
                                    <Detail
                                        label="Interior Color"
                                        value={listing.interior_color}
                                    />
                                </dl>
                            </section>

                            {/* Similar */}
                            {similarListings.length > 0 && (
                                <section>
                                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                        Similar Listings
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {similarListings.map((item) => (
                                            <HomeListingCard
                                                key={item.id}
                                                listing={vehicleListingToDisplay(
                                                    item,
                                                )}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:block lg:sticky lg:top-24">
                                <TitleBlock
                                    listing={listing}
                                    monthly={monthly}
                                    listedDate={listedDate}
                                    isOwner={isOwner}
                                />
                            </div>

                            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-[22rem]">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Contact Seller
                                </h2>
                                <dl className="mt-4 space-y-3 text-sm">
                                    <Detail label="Name" value={listing.contact_name} />
                                    <Detail label="Email" value={listing.contact_email} />
                                    <Detail label="Phone" value={listing.contact_phone} />
                                </dl>
                                <div className="mt-6 space-y-2">
                                    <Button
                                        className="w-full bg-[#1565C0] hover:bg-[#0D47A1]"
                                        asChild
                                    >
                                        <a href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(`Interested in ${listing.title}`)}`}>
                                            <Mail className="size-4" />
                                            Email Seller
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-gray-300"
                                        asChild
                                    >
                                        <a href={`tel:${listing.contact_phone}`}>
                                            <Phone className="size-4" />
                                            Call Seller
                                        </a>
                                    </Button>
                                </div>
                                {isOwner && (
                                    <p className="mt-4 text-center text-xs text-gray-500">
                                        This is your listing.{' '}
                                        <Link
                                            href="/listings"
                                            className="font-medium text-[#1565C0] hover:underline"
                                        >
                                            Manage in My Listings
                                        </Link>
                                    </p>
                                )}
                            </section>
                        </div>
                    </div>
                </main>

                <HomeFooter />
            </div>
        </>
    );
}

function TitleBlock({
    listing,
    monthly,
    listedDate,
    isOwner,
}: {
    listing: VehicleListing;
    monthly: number;
    listedDate: string | null;
    isOwner: boolean;
}) {
    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                    {listing.title}
                </h1>
                {!isOwner && listing.status === 'approved' && (
                    <Badge className="border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Available
                    </Badge>
                )}
                {isOwner && (
                    <Badge variant="outline">{listing.status_label}</Badge>
                )}
            </div>
            <p className="mt-2 text-3xl font-extrabold text-[#1565C0]">
                {formatPrice(listing.asking_price)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
                Est. {formatPrice(monthly)}/mo · {formatMileage(listing.mileage)}{' '}
                mi · {listing.drivetrain}
            </p>
            {listedDate && (
                <p className="mt-2 text-xs text-gray-400">
                    Listed on {listedDate}
                </p>
            )}
        </>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                {value}
            </dd>
        </div>
    );
}
