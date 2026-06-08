import { Head, Link, router } from '@inertiajs/react';
import { Car, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/data/homepage';
import { cn } from '@/lib/utils';
import type { VehicleListing } from '@/types/market';

type Filters = {
    status: string;
    q: string;
    sort: string;
};

type Counts = {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
};

type Props = {
    listings: VehicleListing[];
    filters: Filters;
    counts: Counts;
};

const statusStyles: Record<string, string> = {
    approved:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
    pending:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
    rejected:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
};

const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'approved', label: 'Live' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Not Approved' },
] as const;

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
];

export default function MyListings({ listings, filters, counts }: Props) {
    const [search, setSearch] = useState(filters.q);

    const applyFilters = (overrides: Partial<Filters> = {}) => {
        const next = { ...filters, ...overrides };

        router.get('/listings', next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.q !== '' ||
        filters.sort !== 'newest';

    return (
        <>
            <Head title="My Listings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#1565C0] dark:text-[#90caf9]">
                            Web2Autos Market
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            My Listings
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Filter, edit, and manage your classified ads.
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

                {counts.all === 0 ? (
                    <Card className="border-dashed border-input py-12">
                        <CardContent className="flex flex-col items-center text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
                                <Car className="size-7 text-[#1565C0] dark:text-[#90caf9]" />
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-foreground">
                                No listings yet
                            </h2>
                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
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
                    <>
                        <Card className="gap-4 py-5 shadow-sm">
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {STATUS_TABS.map((tab) => {
                                        const count =
                                            counts[
                                                tab.value as keyof Counts
                                            ] ?? 0;
                                        const active =
                                            filters.status === tab.value;

                                        return (
                                            <button
                                                key={tab.value}
                                                type="button"
                                                onClick={() =>
                                                    applyFilters({
                                                        status: tab.value,
                                                    })
                                                }
                                                className={cn(
                                                    'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                                                    active
                                                        ? 'border-[#1565C0] bg-[#1565C0] text-white'
                                                        : 'border-border bg-card text-muted-foreground hover:border-[#1565C0]/40 hover:text-[#1565C0] dark:hover:text-[#90caf9]',
                                                )}
                                            >
                                                {tab.label}
                                                <span
                                                    className={cn(
                                                        'ml-1.5 text-xs',
                                                        active
                                                            ? 'text-white/80'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            value={search}
                                            placeholder="Search make, model, trim, or VIN…"
                                            className="border-input bg-background pl-9"
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    applyFilters({ q: search });
                                                }
                                            }}
                                        />
                                    </div>
                                    <select
                                        value={filters.sort}
                                        onChange={(e) =>
                                            applyFilters({
                                                sort: e.target.value,
                                            })
                                        }
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                                    >
                                        {SORT_OPTIONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            applyFilters({ q: search })
                                        }
                                        className="bg-[#1565C0] hover:bg-[#0D47A1]"
                                    >
                                        Search
                                    </Button>
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            applyFilters({
                                                status: 'all',
                                                q: '',
                                                sort: 'newest',
                                            });
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-[#1565C0] hover:underline dark:text-[#90caf9]"
                                    >
                                        <X className="size-3" />
                                        Clear filters
                                    </button>
                                )}
                            </CardContent>
                        </Card>

                        {listings.length === 0 ? (
                            <Card className="border-dashed border-input py-12">
                                <CardContent className="text-center">
                                    <p className="font-semibold text-foreground">
                                        No listings match your filters
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Try a different search or status tab.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="gap-0 py-0 shadow-sm">
                                <CardHeader className="border-b border-border py-5">
                                    <CardTitle className="text-base">
                                        {listings.length} listing
                                        {listings.length !== 1 ? 's' : ''}
                                    </CardTitle>
                                    <CardDescription>
                                        Approved listings also appear on the
                                        homepage
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
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
                                                    className="size-20 shrink-0 rounded-lg object-cover ring-1 ring-border"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-foreground">
                                                            {listing.title}
                                                        </h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                statusStyles[
                                                                    listing
                                                                        .status
                                                                ] ??
                                                                statusStyles.pending
                                                            }
                                                        >
                                                            {
                                                                listing.status_label
                                                            }
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-0.5 text-lg font-bold text-[#1565C0] dark:text-[#90caf9]">
                                                        {formatPrice(
                                                            listing.asking_price,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {listing.mileage.toLocaleString()}{' '}
                                                        mi ·{' '}
                                                        {listing.drivetrain} ·{' '}
                                                        {listing.condition}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/listings/${listing.id}/edit`}
                                                        >
                                                            <Pencil />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/market/${listing.id}`}
                                                        >
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                                                            >
                                                                <Trash2 />
                                                                Delete
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>
                                                                Delete this
                                                                listing?
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                This will
                                                                permanently
                                                                remove{' '}
                                                                <span className="font-medium text-foreground">
                                                                    {
                                                                        listing.title
                                                                    }
                                                                </span>{' '}
                                                                from Web2Autos
                                                                Market. This
                                                                cannot be
                                                                undone.
                                                            </DialogDescription>
                                                            <DialogFooter>
                                                                <DialogClose
                                                                    asChild
                                                                >
                                                                    <Button variant="outline">
                                                                        Cancel
                                                                    </Button>
                                                                </DialogClose>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        router.delete(
                                                                            `/listings/${listing.id}`,
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                    listing
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

MyListings.layout = {
    breadcrumbs: [{ title: 'My Listings', href: '/listings' }],
};
