import { usePage } from '@inertiajs/react';
import { FeaturedSection } from '@/components/market/home/featured-section';
import {
    HomeHero,
} from '@/components/market/home/header-hero';
import { MarketShell } from '@/components/market/home/market-shell';
import { HomeSearchBar } from '@/components/market/home/search-bar';
import {
    CategoriesSection,
    HowItWorksSection,
} from '@/components/market/home/sections';
import { SeoHead } from '@/components/seo/seo-head';
import { resolveFeaturedListings } from '@/data/homepage';
import {
    buildOrganizationSchema,
    buildWebsiteSchema,
} from '@/lib/seo-schema';
import { register } from '@/routes';
import type { Auth } from '@/types';
import type { SeoDefaults } from '@/types/seo';
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
    const { auth, seo } = usePage<{ auth: Auth; seo: SeoDefaults }>().props;
    const listHref = auth.user ? '/listings/create' : register();
    const displayListings = resolveFeaturedListings(listings);
    const usingSavedListings = listings.length > 0;

    return (
        <>
            <SeoHead
                title="Web2Autos.com — Buy. Sell. Finance."
                description={seo.defaultDescription}
                path="/"
                jsonLd={[
                    buildWebsiteSchema(
                        seo.appUrl,
                        seo.siteName,
                        seo.defaultDescription,
                    ),
                    buildOrganizationSchema(seo.appUrl, seo.siteName),
                ]}
            />

            <MarketShell auth={auth} listHref={listHref}>
                <HomeHero listHref={listHref} />
                <HomeSearchBar filterOptions={filterOptions} />
                <FeaturedSection
                    listings={displayListings}
                    listHref={listHref}
                    usingSavedListings={usingSavedListings}
                />
                <CategoriesSection />
                <HowItWorksSection />

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
                            className="mt-6 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-bold text-[#1565C0] shadow-lg transition hover:bg-blue-50 dark:bg-card dark:hover:bg-muted/50"
                        >
                            Post Your Car — It&apos;s Free
                        </a>
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
