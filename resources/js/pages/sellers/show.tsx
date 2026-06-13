import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Car,
    CheckCircle2,
    MessageSquare,
    Search,
    Star,
} from 'lucide-react';
import { FormEvent, useRef } from 'react';
import { RatingSummary } from '@/components/sellers/rating-summary';
import { ReviewCard } from '@/components/sellers/review-card';
import { ReviewForm } from '@/components/sellers/review-form';
import {
    SellerSidebarCard,
    SellerStatsBar,
} from '@/components/sellers/seller-sidebar-card';
import { MarketShell } from '@/components/market/home/market-shell';
import { HomeListingCard } from '@/components/market/home/listing-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    PaginationLinks,
    type Paginated,
} from '@/components/ui/pagination-links';
import { vehicleListingToDisplay } from '@/data/homepage';
import { register } from '@/routes';
import type { Auth } from '@/types';
import type { VehicleListing } from '@/types/market';
import type { SellerProfile, SellerReview } from '@/types/sellers';

type Props = {
    seller: SellerProfile;
    listings: Paginated<VehicleListing>;
    reviews: Paginated<SellerReview>;
    filters: {
        q: string;
        tab: 'listings' | 'reviews';
    };
    messageListingSlug?: string | null;
    canReview: boolean;
    hasReviewed: boolean;
};

export default function SellerProfilePage({
    seller,
    listings,
    reviews,
    filters,
    messageListingSlug,
    canReview,
    hasReviewed,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : register();
    const messageHref = messageListingSlug
        ? `/market/${messageListingSlug}/message`
        : undefined;
    const isOwnProfile = auth.user?.id === seller.id;
    const reviewSectionRef = useRef<HTMLDivElement>(null);
    const activeTab = filters.tab;

    const switchTab = (tab: 'listings' | 'reviews') => {
        router.get(
            window.location.pathname,
            { tab, ...(filters.q ? { q: filters.q } : {}) },
            { preserveScroll: true, preserveState: true },
        );
    };

    const goToReviews = () => {
        switchTab('reviews');
        setTimeout(() => {
            reviewSectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 100);
    };

    return (
        <>
            <Head title={`${seller.name} — Seller`} />

            <MarketShell auth={auth} listHref={listHref} className="bg-muted/30">
                <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
                        <SellerSidebarCard
                            seller={seller}
                            messageHref={messageHref}
                            isOwnProfile={isOwnProfile}
                        />

                        <div className="min-w-0 space-y-5">
                            <SellerStatsBar
                                seller={seller}
                                showWriteReview={
                                    canReview ||
                                    (!auth.user && !isOwnProfile) ||
                                    (auth.user &&
                                        !canReview &&
                                        !hasReviewed &&
                                        !isOwnProfile)
                                }
                                onWriteReview={goToReviews}
                            />

                            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                                <div className="flex min-w-max border-b border-border">
                                    <TabButton
                                        active={activeTab === 'listings'}
                                        onClick={() => switchTab('listings')}
                                        label="Recent listings"
                                        count={listings.total}
                                    />
                                    <TabButton
                                        active={activeTab === 'reviews'}
                                        onClick={() => switchTab('reviews')}
                                        label="Reviews for this seller"
                                        count={reviews.total}
                                    />
                                </div>

                                <div className="p-4 sm:p-5">
                                    {activeTab === 'listings' && (
                                        <ListingsPanel
                                            listings={listings}
                                            search={filters.q}
                                        />
                                    )}

                                    {activeTab === 'reviews' && (
                                        <div ref={reviewSectionRef}>
                                            <ReviewsPanel
                                                seller={seller}
                                                reviews={reviews}
                                                canReview={canReview}
                                                hasReviewed={hasReviewed}
                                                isOwnProfile={isOwnProfile}
                                                messageHref={messageHref}
                                                isLoggedIn={!!auth.user}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </MarketShell>
        </>
    );
}

function TabButton({
    active,
    onClick,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition ${
                active
                    ? 'text-[#1565C0] dark:text-[#90caf9]'
                    : 'text-muted-foreground hover:text-foreground'
            }`}
        >
            {label}
            <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                    active
                        ? 'bg-[#1565C0]/10 text-[#1565C0]'
                        : 'bg-muted text-muted-foreground'
                }`}
            >
                {count}
            </span>
            {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1565C0] dark:bg-[#90caf9]" />
            )}
        </button>
    );
}

function ListingsPanel({
    listings,
    search,
}: {
    listings: Paginated<VehicleListing>;
    search: string;
}) {
    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const q = (formData.get('q') as string)?.trim() ?? '';

        router.get(
            window.location.pathname,
            { tab: 'listings', ...(q ? { q } : {}) },
            { preserveScroll: true },
        );
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    name="q"
                    defaultValue={search}
                    placeholder="Search seller listings"
                    className="flex-1"
                />
                <Button
                    type="submit"
                    className="shrink-0 bg-[#1565C0] px-4 hover:bg-[#0D47A1]"
                >
                    <Search className="size-4" />
                    <span className="sr-only">Search</span>
                </Button>
            </form>

            {listings.data.length === 0 ? (
                <EmptyPanel
                    icon={Car}
                    title={
                        listings.total === 0
                            ? 'No listings yet'
                            : 'No matches found'
                    }
                    description={
                        listings.total === 0
                            ? 'This seller has no active listings right now.'
                            : 'Try a different search term.'
                    }
                />
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        Showing {listings.data.length} of {listings.total}{' '}
                        listing{listings.total !== 1 ? 's' : ''}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {listings.data.map((listing) => (
                            <HomeListingCard
                                key={listing.id}
                                listing={vehicleListingToDisplay(listing)}
                            />
                        ))}
                    </div>
                    <PaginationLinks
                        links={listings.links}
                        lastPage={listings.last_page}
                    />
                </>
            )}
        </div>
    );
}

function ReviewsPanel({
    seller,
    reviews,
    canReview,
    hasReviewed,
    isOwnProfile,
    messageHref,
    isLoggedIn,
}: {
    seller: SellerProfile;
    reviews: Paginated<SellerReview>;
    canReview: boolean;
    hasReviewed: boolean;
    isOwnProfile: boolean;
    messageHref?: string;
    isLoggedIn: boolean;
}) {
    return (
        <div className="space-y-5">
            {canReview && (
                <div className="rounded-xl border border-[#1565C0]/20 bg-[#1565C0]/5 p-4 dark:bg-[#1565C0]/10">
                    <p className="mb-3 text-sm font-medium text-foreground">
                        Share your experience with {seller.name}
                    </p>
                    <ReviewForm sellerId={seller.id} variant="inline" />
                </div>
            )}

            {hasReviewed && (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                        You already reviewed this seller. Thank you!
                    </p>
                </div>
            )}

            {!isLoggedIn && !isOwnProfile && (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Sign in and message this seller to write a review.
                    </p>
                    <Button className="mt-3 bg-[#1565C0] hover:bg-[#0D47A1]" asChild>
                        <Link href={register()}>Sign in</Link>
                    </Button>
                </div>
            )}

            {isLoggedIn &&
                !canReview &&
                !hasReviewed &&
                !isOwnProfile &&
                messageHref && (
                    <div className="rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                        <p>
                            Message {seller.name} first, then you can leave a
                            review here.
                        </p>
                        <Button variant="outline" size="sm" className="mt-3" asChild>
                            <Link href={messageHref}>
                                <MessageSquare className="size-4" />
                                Message seller
                            </Link>
                        </Button>
                    </div>
                )}

            {seller.review_count > 0 && (
                <RatingSummary
                    averageRating={seller.average_rating}
                    reviewCount={seller.review_count}
                    distribution={seller.rating_distribution}
                />
            )}

            {reviews.data.length > 0 ? (
                <>
                    <div className="space-y-3">
                        {reviews.data.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                    <PaginationLinks
                        links={reviews.links}
                        lastPage={reviews.last_page}
                    />
                </>
            ) : (
                !canReview &&
                !hasReviewed && (
                    <EmptyPanel
                        icon={Star}
                        title="No reviews yet"
                        description={`Be the first to review ${seller.name}.`}
                    />
                )
            )}
        </div>
    );
}

function EmptyPanel({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Car;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <Icon className="mx-auto size-8 text-muted-foreground/50" />
            <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
