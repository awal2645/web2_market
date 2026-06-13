import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { MarketShell } from '@/components/market/home/market-shell';
import { PrivatePageHead } from '@/components/seo/seo-head';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/data/homepage';
import { register as registerRoute } from '@/routes';
import type { Auth } from '@/types';
import type { VehicleListing } from '@/types/market';

type Props = {
    listing: VehicleListing;
    defaultMessage: string;
};

export default function ListingMessage({
    listing,
    defaultMessage,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : registerRoute();
    const [body, setBody] = useState(defaultMessage);
    const [sending, setSending] = useState(false);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        const trimmed = body.trim();

        if (!trimmed || sending || !listing.seller_id) {
            return;
        }

        setSending(true);

        router.post(
            '/messages',
            {
                recipient_id: listing.seller_id,
                vehicle_listing_id: listing.id,
                body: trimmed,
            },
            {
                onFinish: () => setSending(false),
            },
        );
    };

    return (
        <>
            <PrivatePageHead title={`Message Seller - ${listing.title}`} />

            <MarketShell auth={auth} listHref={listHref}>
                <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-[#1565C0]">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/browse" className="hover:text-[#1565C0]">
                            Browse
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/market/${listing.slug}`}
                            className="hover:text-[#1565C0]"
                        >
                            {listing.title}
                        </Link>
                        <span>/</span>
                        <span className="font-medium text-foreground">
                            Message
                        </span>
                    </div>

                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/market/${listing.slug}`}>
                                <ArrowLeft className="size-4" />
                                Back to listing
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="border-b border-border pb-4">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                About this listing
                            </p>
                            <h1 className="mt-1 text-xl font-bold text-foreground">
                                {listing.title}
                            </h1>
                            <p className="mt-1 text-2xl font-extrabold text-[#1565C0] dark:text-[#90caf9]">
                                {formatPrice(listing.asking_price)}
                            </p>
                            <Link
                                href={`/market/${listing.slug}`}
                                className="mt-2 inline-block text-sm text-[#1565C0] hover:underline dark:text-[#90caf9]"
                            >
                                View listing details
                            </Link>
                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-foreground">
                                Message Seller
                            </h2>
                            <dl className="mt-4 space-y-3 text-sm">
                                <Detail
                                    label="Name"
                                    value={listing.contact_name}
                                />
                                <Detail
                                    label="Email"
                                    value={listing.contact_email}
                                />
                                <Detail
                                    label="Phone"
                                    value={listing.contact_phone}
                                />
                            </dl>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label
                                    htmlFor="message-body"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Your message
                                </label>
                                <textarea
                                    id="message-body"
                                    value={body}
                                    onChange={(event) =>
                                        setBody(event.target.value)
                                    }
                                    rows={5}
                                    required
                                    disabled={sending}
                                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20"
                                    placeholder="Write your message to the seller..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Button
                                    type="submit"
                                    disabled={sending || !body.trim()}
                                    className="w-full bg-[#1565C0] hover:bg-[#0D47A1]"
                                >
                                    <Send className="size-4" />
                                    Send Message
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <a
                                        href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(`Interested in ${listing.title}`)}`}
                                    >
                                        <Mail className="size-4" />
                                        Email Seller
                                    </a>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <a href={`tel:${listing.contact_phone}`}>
                                        <Phone className="size-4" />
                                        Call Seller
                                    </a>
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </MarketShell>
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
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-foreground">
                {value}
            </dd>
        </div>
    );
}
