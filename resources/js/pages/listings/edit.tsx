import type { ListingFormOptions, VehicleListing } from '@/types/market';
import { ListingForm } from './create';

type Props = {
    listing: VehicleListing;
    options: ListingFormOptions;
    initialStep?: string;
    successListing?: VehicleListing | null;
    approvalMode: string;
};

export default function EditListing({
    listing,
    options,
    initialStep = 'basics',
    successListing = null,
    approvalMode,
}: Props) {
    return (
        <ListingForm
            mode="edit"
            listing={listing}
            options={options}
            initialStep={initialStep}
            successListing={successListing}
            approvalMode={approvalMode}
            defaults={{
                contact_name: listing.contact_name,
                contact_email: listing.contact_email,
            }}
        />
    );
}

EditListing.layout = {
    breadcrumbs: [
        { title: 'My Listings', href: '/listings' },
        { title: 'Edit Listing', href: '#' },
    ],
};
