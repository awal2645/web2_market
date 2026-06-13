import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { MarketShell } from '@/components/market/home/market-shell';
import { HomeListingCard } from '@/components/market/home/listing-card';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { vehicleListingToDisplay } from '@/data/homepage';
import { register } from '@/routes';
import type { Auth } from '@/types';
import type { VehicleListing } from '@/types/market';

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
};

type Filters = {
    make: string;
    model: string;
    year: string;
    price: string;
    sort: string;
    q: string;
};

type FilterOptions = {
    makes: string[];
    models: string[];
    years: string[];
    prices: string[];
    sorts: { value: string; label: string }[];
};

type Props = {
    listings: Paginated<VehicleListing>;
    filters: Filters;
    filterOptions: FilterOptions;
};

function countActiveFilters(filters: Filters): number {
    return Object.entries(filters).filter(
        ([, value]) =>
            value && value !== 'newest' && !value.startsWith('Any '),
    ).length;
}

export default function Browse({
    listings,
    filters,
    filterOptions,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : register();

    const [localFilters, setLocalFilters] = useState(filters);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const activeFilterCount = countActiveFilters(filters);
    const hasActiveFilters = activeFilterCount > 0;

    const applyFilters = (
        overrides: Partial<Filters> = {},
        closeSheet = false,
    ) => {
        const next = { ...localFilters, ...overrides };
        setLocalFilters(next);
        router.get('/browse', next, { preserveState: true, replace: true });
        if (closeSheet) {
            setFiltersOpen(false);
        }
    };

    const clearFilters = (closeSheet = false) => {
        const empty: Filters = {
            make: '',
            model: '',
            year: '',
            price: '',
            sort: 'newest',
            q: '',
        };
        setLocalFilters(empty);
        router.get('/browse', empty, { preserveState: true, replace: true });
        if (closeSheet) {
            setFiltersOpen(false);
        }
    };

    const displayListings = listings.data.map(vehicleListingToDisplay);

    return (
        <>
            <Head title="Browse Vehicles" />

            <MarketShell auth={auth} listHref={listHref}>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                            Browse Vehicles
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {listings.total} vehicle
                            {listings.total !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    {/* Desktop filters */}
                    <div className="mb-8 hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:block">
                        <BrowseFilterForm
                            localFilters={localFilters}
                            setLocalFilters={setLocalFilters}
                            filterOptions={filterOptions}
                            hasActiveFilters={hasActiveFilters}
                            onApply={() => applyFilters()}
                            onClear={() => clearFilters()}
                        />
                    </div>

                    {/* Results */}
                    {displayListings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-input bg-card py-16 text-center">
                            <p className="text-lg font-semibold text-foreground">
                                No vehicles match your filters
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try adjusting your search or browse all listings.
                            </p>
                            <button
                                type="button"
                                onClick={() => clearFilters()}
                                className="mt-6 rounded-lg bg-[#1565C0] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0D47A1]"
                            >
                                View All Listings
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {displayListings.map((listing) => (
                                    <HomeListingCard
                                        key={listing.id}
                                        listing={listing}
                                    />
                                ))}
                            </div>

                            {listings.last_page > 1 && (
                                <nav className="mt-10 flex justify-center gap-1">
                                    {listings.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            className={`rounded-md px-3 py-1.5 text-sm ${
                                                link.active
                                                    ? 'bg-[#1565C0] text-white'
                                                    : link.url
                                                      ? 'bg-card text-foreground ring-1 ring-border hover:bg-muted/50 dark:hover:bg-muted'
                                                      : 'cursor-not-allowed text-muted-foreground/50'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </nav>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile floating filters button */}
                <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center pb-2 md:hidden">
                    <button
                        type="button"
                        onClick={() => setFiltersOpen(true)}
                        className="relative flex flex-col items-center"
                        aria-label="Open filters"
                    >
                        <span className="mb-0.5 block h-2 w-12 rounded-t-full bg-[#1565C0]" />
                        <span className="flex items-center gap-2 rounded-full bg-[#1565C0] px-10 py-3 text-sm font-bold tracking-wider text-white shadow-lg shadow-[#1565C0]/35">
                            FILTERS
                            {activeFilterCount > 0 && (
                                <span className="flex size-5 items-center justify-center rounded-full bg-card text-xs font-bold text-[#1565C0]">
                                    {activeFilterCount}
                                </span>
                            )}
                        </span>
                    </button>
                </div>

                {/* Mobile filter sheet */}
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetContent
                        side="bottom"
                        className="max-h-[90vh] overflow-y-auto rounded-t-2xl px-4 pb-8"
                    >
                        <SheetHeader className="border-b border-border pb-4">
                            <SheetTitle className="flex items-center gap-2 text-base">
                                <SlidersHorizontal className="size-4 text-[#1565C0]" />
                                Filter &amp; Sort
                            </SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                            <BrowseFilterForm
                                localFilters={localFilters}
                                setLocalFilters={setLocalFilters}
                                filterOptions={filterOptions}
                                hasActiveFilters={hasActiveFilters}
                                onApply={() => applyFilters({}, true)}
                                onClear={() => clearFilters(true)}
                                stacked
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </MarketShell>
        </>
    );
}

function BrowseFilterForm({
    localFilters,
    setLocalFilters,
    filterOptions,
    hasActiveFilters,
    onApply,
    onClear,
    stacked = false,
}: {
    localFilters: Filters;
    setLocalFilters: React.Dispatch<React.SetStateAction<Filters>>;
    filterOptions: FilterOptions;
    hasActiveFilters: boolean;
    onApply: () => void;
    onClear: () => void;
    stacked?: boolean;
}) {
    return (
        <>
            {!stacked && (
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <SlidersHorizontal className="size-4 text-[#1565C0]" />
                    Filter &amp; Sort
                </div>
            )}
            <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">
                    Keyword
                </label>
                <input
                    type="search"
                    value={localFilters.q}
                    onChange={(e) =>
                        setLocalFilters((f) => ({ ...f, q: e.target.value }))
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onApply();
                        }
                    }}
                    placeholder="Search make, model, trim, or VIN…"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                />
            </div>
            <div
                className={
                    stacked
                        ? 'grid gap-3'
                        : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-6'
                }
            >
                <FilterSelect
                    label="Make"
                    value={localFilters.make || 'Any Make'}
                    options={filterOptions.makes}
                    onChange={(v) =>
                        setLocalFilters((f) => ({ ...f, make: v }))
                    }
                />
                <FilterSelect
                    label="Model"
                    value={localFilters.model || 'Any Model'}
                    options={filterOptions.models}
                    onChange={(v) =>
                        setLocalFilters((f) => ({ ...f, model: v }))
                    }
                />
                <FilterSelect
                    label="Year"
                    value={localFilters.year || 'Any Year'}
                    options={filterOptions.years}
                    onChange={(v) =>
                        setLocalFilters((f) => ({ ...f, year: v }))
                    }
                />
                <FilterSelect
                    label="Price"
                    value={localFilters.price || 'Any Price'}
                    options={filterOptions.prices}
                    onChange={(v) =>
                        setLocalFilters((f) => ({ ...f, price: v }))
                    }
                />
                <FilterSelect
                    label="Sort"
                    value={localFilters.sort || 'newest'}
                    options={filterOptions.sorts.map((s) => s.label)}
                    optionValues={filterOptions.sorts.map((s) => s.value)}
                    onChange={(v) =>
                        setLocalFilters((f) => ({ ...f, sort: v }))
                    }
                />
                <div
                    className={
                        stacked ? '' : 'flex items-end sm:col-span-2 lg:col-span-1'
                    }
                >
                    <button
                        type="button"
                        onClick={onApply}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1565C0] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0D47A1]"
                    >
                        <Search className="size-4" />
                        Search
                    </button>
                </div>
            </div>
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1565C0] hover:underline"
                >
                    <X className="size-3" />
                    Clear all filters
                </button>
            )}
        </>
    );
}

function FilterSelect({
    label,
    value,
    options,
    optionValues,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    optionValues?: string[];
    onChange: (value: string) => void;
}) {
    const values = optionValues ?? options;

    return (
        <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
            >
                {options.map((opt, i) => (
                    <option key={opt} value={values[i] ?? opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}
