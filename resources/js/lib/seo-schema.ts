import { formatMileage, formatPrice } from '@/data/homepage';
import { toAbsoluteUrl } from '@/lib/seo';
import type { VehicleListing } from '@/types/market';
import type { SellerProfile } from '@/types/sellers';

export function buildWebsiteSchema(appUrl: string, siteName: string, description: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: appUrl,
        description,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${appUrl}/browse?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

export function buildOrganizationSchema(appUrl: string, siteName: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: appUrl,
        logo: `${appUrl}/favicon.svg`,
    };
}

export function buildVehicleListingSchema(appUrl: string, listing: VehicleListing) {
    const url = toAbsoluteUrl(appUrl, `/market/${listing.slug}`);
    const image = listing.images[0]?.url
        ? toAbsoluteUrl(appUrl, listing.images[0].url)
        : undefined;

    return {
        '@context': 'https://schema.org',
        '@type': 'Car',
        name: listing.title,
        description:
            listing.seller_notes?.trim() ||
            `${listing.title} listed for ${formatPrice(listing.asking_price)} with ${formatMileage(listing.mileage)} miles.`,
        url,
        ...(image ? { image } : {}),
        brand: {
            '@type': 'Brand',
            name: listing.make,
        },
        model: listing.model,
        vehicleModelDate: listing.year,
        mileageFromOdometer: {
            '@type': 'QuantitativeValue',
            value: listing.mileage,
            unitCode: 'SMI',
        },
        offers: {
            '@type': 'Offer',
            price: listing.asking_price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url,
        },
    };
}

export function buildListingBreadcrumbSchema(appUrl: string, listing: VehicleListing) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: appUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Browse',
                item: `${appUrl}/browse`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: listing.title,
                item: toAbsoluteUrl(appUrl, `/market/${listing.slug}`),
            },
        ],
    };
}

export function buildSellerSchema(appUrl: string, seller: SellerProfile) {
    const url = toAbsoluteUrl(appUrl, `/sellers/${seller.slug ?? seller.id}`);

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: seller.name,
        url,
    };

    if (seller.avatar) {
        schema.image = toAbsoluteUrl(appUrl, seller.avatar);
    }

    if (seller.review_count > 0 && seller.average_rating != null) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: seller.average_rating,
            reviewCount: seller.review_count,
            bestRating: 5,
            worstRating: 1,
        };
    }

    return schema;
}

export function buildBrowseBreadcrumbSchema(appUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: appUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Browse Vehicles',
                item: `${appUrl}/browse`,
            },
        ],
    };
}
