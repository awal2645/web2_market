import { Form, Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Heading from '@/components/heading';
import type { VehicleListing } from '@/types/market';

type Props = {
    listings: VehicleListing[];
    approvalMode: string;
};

export default function AdminListings({ listings, approvalMode }: Props) {
    return (
        <>
            <Head title="Admin - Vehicle Listings" />

            <div className="space-y-8">
                <Heading
                    title="Web2Autos Market Admin"
                    description="Review vehicle listings and configure approval settings."
                />

                <section className="space-y-4 rounded-xl border p-6">
                    <h2 className="text-lg font-medium">Approval Settings</h2>
                    <Form
                        action="/admin/settings"
                        method="patch"
                        options={{ preserveScroll: true }}
                        className="flex flex-col gap-4 sm:flex-row sm:items-end"
                    >
                        {({ processing }) => (
                            <>
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="listing_approval_mode">
                                        Listing Approval Mode
                                    </Label>
                                    <select
                                        id="listing_approval_mode"
                                        name="listing_approval_mode"
                                        defaultValue={approvalMode}
                                        className="border-input bg-background h-9 w-full max-w-md rounded-md border px-3 text-sm"
                                    >
                                        <option value="manual">
                                            Manual Approval — admin reviews
                                            before listings go live
                                        </option>
                                        <option value="automatic">
                                            Automatic Approval — listings go
                                            live immediately
                                        </option>
                                    </select>
                                </div>
                                <Button type="submit" disabled={processing}>
                                    Save Settings
                                </Button>
                            </>
                        )}
                    </Form>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-medium">
                        All Listings ({listings.length})
                    </h2>

                    {listings.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No listings yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {listings.map((listing) => (
                                <article
                                    key={listing.id}
                                    className="rounded-xl border p-6"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-medium">
                                                {listing.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                Seller: {listing.seller_name} ·{' '}
                                                {new Intl.NumberFormat(
                                                    'en-US',
                                                    {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                        maximumFractionDigits: 0,
                                                    },
                                                ).format(listing.asking_price)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                listing.status === 'approved'
                                                    ? 'default'
                                                    : listing.status ===
                                                        'rejected'
                                                      ? 'destructive'
                                                      : 'secondary'
                                            }
                                        >
                                            {listing.status_label}
                                        </Badge>
                                    </div>

                                    {listing.images[0] && (
                                        <img
                                            src={listing.images[0].url}
                                            alt={listing.title}
                                            className="mt-4 aspect-video w-full max-w-xs rounded-lg border object-cover"
                                        />
                                    )}

                                    {listing.status === 'pending' && (
                                        <div className="mt-4 flex gap-3">
                                            <Form
                                                action={`/admin/listings/${listing.id}/approve`}
                                                method="post"
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                            >
                                                <Button type="submit" size="sm">
                                                    Approve
                                                </Button>
                                            </Form>
                                            <Form
                                                action={`/admin/listings/${listing.id}/reject`}
                                                method="post"
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    variant="destructive"
                                                >
                                                    Reject
                                                </Button>
                                            </Form>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

AdminListings.layout = {
    breadcrumbs: [{ title: 'Admin Listings', href: '/admin/listings' }],
};
