import { Link } from '@inertiajs/react';
import {
    ChevronRight,
    Mail,
    MessageSquare,
    Phone,
    Star,
} from 'lucide-react';
import { StarRatingDisplay } from '@/components/sellers/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { VehicleListing } from '@/types/market';
import type { SellerRatingStats } from '@/types/sellers';

type MessageConversation = {
    id: string;
    url: string;
    last_message: string | null;
    last_message_at: string | null;
};

type Props = {
    listing: VehicleListing;
    isOwner: boolean;
    sellerProfileUrl?: string | null;
    sellerRating?: SellerRatingStats | null;
    messageUrl?: string;
    messageConversation?: MessageConversation | null;
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export function SellerContactCard({
    listing,
    isOwner,
    sellerProfileUrl,
    sellerRating,
    messageUrl,
    messageConversation,
}: Props) {
    const sellerName = listing.seller_name ?? listing.contact_name;
    const hasReviews =
        sellerRating !== null &&
        sellerRating !== undefined &&
        sellerRating.count > 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-[22rem]">
            <div className="border-b border-border bg-gradient-to-br from-[#1565C0]/5 via-transparent to-transparent px-6 py-4 dark:from-[#1565C0]/10">
                <h2 className="text-lg font-semibold text-foreground">
                    Contact Seller
                </h2>
            </div>

            <div className="p-6">
                {sellerProfileUrl ? (
                    <Link
                        href={sellerProfileUrl}
                        className="group flex items-center gap-4 rounded-xl border border-border/80 bg-muted/20 p-4 transition hover:border-[#1565C0]/40 hover:bg-[#1565C0]/5 dark:hover:bg-[#1565C0]/10"
                    >
                        <Avatar className="size-14 shrink-0 ring-2 ring-background shadow-sm">
                            <AvatarImage
                                src={listing.seller_avatar ?? undefined}
                            />
                            <AvatarFallback className="bg-[#1565C0]/10 text-base font-semibold text-[#1565C0]">
                                {initials(sellerName)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-semibold text-foreground group-hover:text-[#1565C0] dark:group-hover:text-[#90caf9]">
                                {sellerName}
                            </p>

                            {hasReviews ? (
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <StarRatingDisplay
                                        rating={sellerRating.average ?? 0}
                                        size="sm"
                                    />
                                    <span className="text-sm font-semibold text-foreground">
                                        {sellerRating.average?.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        ({sellerRating.count} review
                                        {sellerRating.count !== 1 ? 's' : ''})
                                    </span>
                                </div>
                            ) : (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <div className="flex">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star
                                                key={i}
                                                className="size-3.5 fill-muted text-muted-foreground/25"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        No reviews yet
                                    </span>
                                </div>
                            )}

                            <p className="mt-1.5 flex items-center gap-0.5 text-xs font-medium text-[#1565C0] dark:text-[#90caf9]">
                                View seller profile
                                <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
                            </p>
                        </div>
                    </Link>
                ) : (
                    <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-muted/20 p-4">
                        <Avatar className="size-14 shrink-0">
                            <AvatarFallback className="bg-muted text-base font-semibold">
                                {initials(listing.contact_name)}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-base font-semibold text-foreground">
                            {listing.contact_name}
                        </p>
                    </div>
                )}

                <div className="mt-4 space-y-2">
                    <a
                        href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(`Interested in ${listing.title}`)}`}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition hover:bg-muted/60"
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1565C0]/10 text-[#1565C0] dark:bg-[#1565C0]/20 dark:text-[#90caf9]">
                            <Mail className="size-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Email
                            </span>
                            <span className="block truncate font-medium text-foreground">
                                {listing.contact_email}
                            </span>
                        </span>
                    </a>

                    <a
                        href={`tel:${listing.contact_phone}`}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition hover:bg-muted/60"
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1565C0]/10 text-[#1565C0] dark:bg-[#1565C0]/20 dark:text-[#90caf9]">
                            <Phone className="size-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Phone
                            </span>
                            <span className="block font-medium text-foreground">
                                {listing.contact_phone}
                            </span>
                        </span>
                    </a>
                </div>

                {messageConversation && (
                    <div className="mt-5 rounded-xl border border-[#1565C0]/25 bg-gradient-to-br from-blue-50/80 to-transparent p-4 dark:border-blue-800 dark:from-blue-950/40">
                        <p className="text-[10px] font-bold tracking-widest text-[#1565C0] uppercase dark:text-[#90caf9]">
                            Your conversation
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground">
                            {messageConversation.last_message ??
                                'No messages yet'}
                        </p>
                        <Button
                            className="mt-3 w-full bg-[#1565C0] hover:bg-[#0D47A1]"
                            asChild
                        >
                            <Link href={messageConversation.url}>
                                <MessageSquare className="size-4" />
                                View Messages
                            </Link>
                        </Button>
                    </div>
                )}

                {!isOwner && (
                    <div className="mt-5 space-y-2.5">
                        {!isOwner && listing.seller_id && messageUrl && (
                            <Button
                                className="h-11 w-full bg-[#1565C0] text-base shadow-sm hover:bg-[#0D47A1]"
                                asChild
                            >
                                <Link href={messageUrl}>
                                    <MessageSquare className="size-4" />
                                    {messageConversation
                                        ? 'Continue Message'
                                        : 'Message Seller'}
                                </Link>
                            </Button>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className="h-10"
                                asChild
                            >
                                <a
                                    href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(`Interested in ${listing.title}`)}`}
                                >
                                    <Mail className="size-4" />
                                    Email
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10"
                                asChild
                            >
                                <a href={`tel:${listing.contact_phone}`}>
                                    <Phone className="size-4" />
                                    Call
                                </a>
                            </Button>
                        </div>
                    </div>
                )}

                {isOwner && (
                    <p className="mt-5 rounded-lg bg-muted/50 px-3 py-3 text-center text-xs text-muted-foreground">
                        This is your listing.{' '}
                        <Link
                            href="/listings"
                            className="font-semibold text-[#1565C0] hover:underline dark:text-[#90caf9]"
                        >
                            Manage in My Listings
                        </Link>
                    </p>
                )}
            </div>
        </section>
    );
}
