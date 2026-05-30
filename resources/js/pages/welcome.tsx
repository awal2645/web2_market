import { Head, usePage } from '@inertiajs/react';
import { FeaturedSection } from '@/components/market/home/featured-section';
import { HomeFooter } from '@/components/market/home/footer';
import {
    HomeHeader,
    HomeHero,
} from '@/components/market/home/header-hero';
import { HomeSearchBar } from '@/components/market/home/search-bar';
import {
    CategoriesSection,
    HowItWorksSection,
    TestimonialsSection,
} from '@/components/market/home/sections';
import { resolveFeaturedListings } from '@/data/homepage';
import { register } from '@/routes';
import type { Auth } from '@/types';
import type { VehicleListing } from '@/types/market';

type Props = {
    listings: VehicleListing[];
    filterOptions?: {
        makes: string[];
        models: string[];
        years: string[];
        prices: string[];
    };
};

export default function Welcome({ listings = [], filterOptions }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : register();
    const displayListings = resolveFeaturedListings(listings);
    const usingSavedListings = listings.length > 0;

    return (
        <>
            <Head title="Web2Autos.com — Buy. Sell. Finance." />

            <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
                <HomeHeader auth={auth} listHref={listHref} />
                <HomeHero listHref={listHref} />
                <HomeSearchBar filterOptions={filterOptions} />
                <FeaturedSection
                    listings={displayListings}
                    listHref={listHref}
                    usingSavedListings={usingSavedListings}
                />
                <CategoriesSection />
                <HowItWorksSection />
                <TestimonialsSection />

                <section
                    id="sell"
                    className="bg-[#1565C0] py-12 text-center text-white"
                >
                    <div className="mx-auto max-w-2xl px-4">
                        <h2 className="text-2xl font-extrabold sm:text-3xl">
                            Ready to Sell Your Car?
                        </h2>
                        <p className="mt-3 text-white/85">
                            List free in minutes. Reach thousands of buyers and
                            skip the lowball trade-in offers.
                        </p>
                        <a
                            href={listHref}
                            className="mt-6 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-bold text-[#1565C0] shadow-lg transition hover:bg-blue-50"
                        >
                            Post Your Car — It&apos;s Free
                        </a>
                    </div>
                </section>

                <HomeFooter />
            </div>
        </>
    );
}
