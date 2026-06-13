export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatMileage(miles: number): string {
    return new Intl.NumberFormat('en-US').format(miles);
}

/** Rough 72-month estimate for display only */
export function estimateMonthlyPayment(price: number): number {
    return Math.round((price * 0.0175) / 5) * 5;
}

export const heroStats = [
    { value: '25,000+', label: 'Cars Listed' },
    { value: '8,500+', label: 'Verified Dealers' },
    { value: '150,000+', label: 'Happy Customers' },
    { value: '24–48 hrs', label: 'Fast Approvals' },
];

export const popularMakes = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'BMW',
    'Mercedes',
];

export const searchOptions = {
    makes: ['Any Make', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'],
    models: ['Any Model', 'Accord', 'Camry', 'Silverado', 'F-150', 'Civic', '330i'],
    years: ['Any Year', '2024', '2023', '2022', '2021', '2020', '2019'],
    prices: [
        'Any Price',
        'Under $15,000',
        '$15,000 – $25,000',
        '$25,000 – $40,000',
        'Over $40,000',
    ],
    locations: ['Any Location', 'California', 'Texas', 'Florida', 'New York', 'Ohio'],
};

export const categories = [
    { label: 'SUVs', icon: 'suv' as const },
    { label: 'Sedans', icon: 'sedan' as const },
    { label: 'Trucks', icon: 'truck' as const },
    { label: 'Luxury', icon: 'luxury' as const },
    { label: 'Loan Calculator', icon: 'calculator' as const },
];

export const howItWorks = [
    {
        step: 1,
        title: 'Find Your Car',
        description:
            'Search thousands of listings from private sellers and verified dealers nationwide.',
    },
    {
        step: 2,
        title: 'Connect & Buy',
        description:
            'Contact sellers directly, schedule test drives, and negotiate your best price.',
    },
    {
        step: 3,
        title: 'Get Financed',
        description:
            'Get pre-approved in minutes and drive away with flexible auto loan options.',
    },
];

export const preApproval = {
    monthly: 389,
    apr: 4.9,
    term: 72,
    benefits: [
        'No impact to credit score',
        'Rates from 4.9% APR',
        'Decision in minutes',
        'Works with any listing',
    ],
};

export const footerLinks = {
    buy: ['Browse Cars', 'SUVs', 'Sedans', 'Trucks', 'Luxury Cars'],
    sell: ['Sell Your Car', 'Post a Listing', 'Pricing Guide', 'Seller Tips'],
    finance: ['Auto Loans', 'Loan Calculator', 'Pre-Approval', 'Refinance'],
    company: ['About Us', 'Careers', 'Press', 'Contact'],
    support: ['Help Center', 'Safety Tips', 'Terms of Service', 'Privacy Policy'],
};

/** Demo featured listings — always uses local car photos */
export const featuredDemoListings = [
    {
        id: 'demo-1',
        title: '2021 Honda Accord EX',
        trim: 'EX',
        mileage: 45000,
        drivetrain: 'FWD',
        asking_price: 21990,
        image: '/images/demo-vehicles/car-3.jpg',
    },
    {
        id: 'demo-2',
        title: '2022 Chevrolet Silverado LT',
        trim: 'LT Crew Cab',
        mileage: 32000,
        drivetrain: '4WD',
        asking_price: 38900,
        image: '/images/demo-vehicles/car-4.jpg',
    },
    {
        id: 'demo-3',
        title: '2023 Toyota Camry SE',
        trim: 'SE',
        mileage: 18000,
        drivetrain: 'FWD',
        asking_price: 24500,
        image: '/images/demo-vehicles/car-2.jpg',
    },
    {
        id: 'demo-4',
        title: '2019 BMW 330i Sport',
        trim: 'Sport Line',
        mileage: 52000,
        drivetrain: 'RWD',
        asking_price: 31500,
        image: '/images/demo-vehicles/car-5.jpg',
    },
];

/** @deprecated use featuredDemoListings */
export const fallbackListings = featuredDemoListings;

export type DisplayListing = {
    id: string | number;
    title: string;
    trim?: string | null;
    mileage: number;
    drivetrain: string;
    asking_price: number;
    image: string;
    href: string;
};

type ApiListing = {
    id: number;
    slug: string;
    title: string;
    trim?: string | null;
    mileage: number;
    drivetrain: string;
    asking_price: number;
    images?: { url: string }[];
};

const demoDisplayListings: DisplayListing[] = featuredDemoListings.map(
    (listing) => ({
        ...listing,
        href: '#vehicles',
    }),
);

export function vehicleListingToDisplay(listing: ApiListing): DisplayListing {
    return {
        id: listing.id,
        title: listing.title,
        trim: listing.trim,
        mileage: listing.mileage,
        drivetrain: listing.drivetrain,
        asking_price: listing.asking_price,
        image:
            listing.images?.[0]?.url ?? '/images/demo-vehicles/car-2.jpg',
        href: `/market/${listing.slug}`,
    };
}

/** Use saved listings when available, otherwise demo placeholders */
export function resolveFeaturedListings(
    listings: ApiListing[] = [],
): DisplayListing[] {
    if (listings.length === 0) {
        return demoDisplayListings;
    }

    return listings.map(vehicleListingToDisplay);
}
