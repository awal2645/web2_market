import { Link } from '@inertiajs/react';
import {
    Car,
    Link2,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Check,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { SellerProfile } from '@/types/sellers';

type Props = {
    seller: SellerProfile;
    messageHref?: string;
    isOwnProfile: boolean;
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function memberSince(iso: string | null): string | null {
    if (!iso) {
        return null;
    }

    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });
}

export function SellerSidebarCard({
    seller,
    messageHref,
    isOwnProfile,
}: Props) {
    const [copied, setCopied] = useState(false);
    const joined = memberSince(seller.member_since);
    const profileUrl =
        seller.profile_url ??
        (typeof window !== 'undefined' ? window.location.pathname : '');

    const copyLink = async () => {
        const url = `${window.location.origin}${profileUrl}`;

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Shop link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy link.');
        }
    };

    return (
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Share shop link
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full justify-start gap-2"
                    onClick={copyLink}
                >
                    {copied ? (
                        <Check className="size-4 text-emerald-600" />
                    ) : (
                        <Link2 className="size-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy shop link'}
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-3">
                    <Avatar className="size-14 shrink-0">
                        <AvatarImage src={seller.avatar ?? undefined} />
                        <AvatarFallback className="bg-[#1565C0]/10 font-bold text-[#1565C0]">
                            {initials(seller.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold leading-tight text-foreground">
                            {seller.name}
                        </h1>
                        {joined && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Member since {joined}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-5 border-t border-border pt-4">
                    <h2 className="text-sm font-semibold text-foreground">
                        About seller
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        Trusted vehicle seller on Web2Autos Market with{' '}
                        {seller.active_listing_count} active listing
                        {seller.active_listing_count !== 1 ? 's' : ''}.
                    </p>
                </div>

                <div className="mt-5 space-y-3 border-t border-border pt-4">
                    {seller.phone && (
                        <a
                            href={`tel:${seller.phone}`}
                            className="flex items-start gap-3 text-sm transition hover:text-[#1565C0]"
                        >
                            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <span className="text-foreground">{seller.phone}</span>
                        </a>
                    )}
                    {seller.email && (
                        <a
                            href={`mailto:${seller.email}`}
                            className="flex items-start gap-3 text-sm transition hover:text-[#1565C0]"
                        >
                            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <span className="break-all text-foreground">
                                {seller.email}
                            </span>
                        </a>
                    )}
                    {seller.address && (
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <span className="text-foreground">{seller.address}</span>
                        </div>
                    )}
                </div>

                {!isOwnProfile && messageHref && (
                    <Button
                        className="mt-5 w-full bg-[#1565C0] hover:bg-[#0D47A1]"
                        asChild
                    >
                        <Link href={messageHref}>
                            <MessageSquare className="size-4" />
                            Message seller
                        </Link>
                    </Button>
                )}
            </div>
        </aside>
    );
}

export function SellerStatsBar({
    seller,
    onWriteReview,
    showWriteReview,
}: {
    seller: SellerProfile;
    onWriteReview: () => void;
    showWriteReview: boolean;
}) {
    const ratingDisplay =
        seller.average_rating !== null
            ? seller.average_rating.toFixed(1)
            : '0';

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-2xl font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    {ratingDisplay}
                </div>
                <div>
                    <p className="font-semibold text-foreground">
                        {seller.average_rating !== null
                            ? `${ratingDisplay} Star Overall Rating`
                            : 'No rating yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {seller.review_count} total review
                        {seller.review_count !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {showWriteReview && (
                <Button
                    className="w-full shrink-0 bg-[#1565C0] text-sm hover:bg-[#0D47A1] sm:w-auto sm:px-6"
                    onClick={onWriteReview}
                >
                    <span className="sm:hidden">Write review</span>
                    <span className="hidden sm:inline">
                        Write a review about this seller
                    </span>
                </Button>
            )}

            <div className="flex items-center gap-3 rounded-lg bg-[#1565C0]/10 px-4 py-3 sm:shrink-0">
                <Car className="size-5 text-[#1565C0]" />
                <div>
                    <p className="text-lg font-bold text-[#1565C0] dark:text-[#90caf9]">
                        {seller.active_listing_count}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                        Active listings
                    </p>
                </div>
            </div>
        </div>
    );
}
