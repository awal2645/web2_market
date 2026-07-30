import { Link, usePage } from '@inertiajs/react';
import { MarketShell } from '@/components/market/home/market-shell';
import { SeoHead } from '@/components/seo/seo-head';
import { company } from '@/data/company';
import {
    TERMS_INTRO,
    TERMS_LAST_UPDATED,
    TERMS_SECTIONS,
} from '@/data/legal/terms-of-service';
import { register } from '@/routes';
import type { Auth } from '@/types';

export default function TermsOfServicePage() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : register.url();

    return (
        <>
            <SeoHead
                title="Terms of Service"
                description="Web2Autos Terms of Service — rules for using our marketplace and services."
                path="/terms"
            />

            <MarketShell auth={auth} listHref={listHref}>
                <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Terms of Service
                    </h1>
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                        Last updated: {TERMS_LAST_UPDATED}
                    </p>
                    <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                        {TERMS_INTRO}
                    </p>

                    <div className="mt-10 space-y-10">
                        {TERMS_SECTIONS.map((section) => (
                            <section
                                key={section.title}
                                aria-labelledby={section.title.replace(
                                    /\s+/g,
                                    '-',
                                )}
                            >
                                <h2
                                    id={section.title.replace(/\s+/g, '-')}
                                    className="text-xl font-bold text-foreground sm:text-2xl"
                                >
                                    {section.title}
                                </h2>

                                {section.paragraphs?.map((paragraph) => (
                                    <p
                                        key={paragraph}
                                        className="mt-4 text-base leading-relaxed text-muted-foreground"
                                    >
                                        {paragraph}
                                    </p>
                                ))}

                                {section.privacyPolicyLink ? (
                                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                                        All data usage is governed by our{' '}
                                        <Link
                                            href="/privacy"
                                            className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                                        >
                                            Privacy Policy
                                        </Link>
                                        , which forms an integral part of these
                                        Terms.
                                    </p>
                                ) : null}

                                {section.bullets?.length ? (
                                    <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-muted-foreground">
                                        {section.bullets.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : null}

                                {section.paragraphsAfter?.map((paragraph) => (
                                    <p
                                        key={paragraph}
                                        className="mt-4 text-base leading-relaxed text-muted-foreground"
                                    >
                                        {paragraph}
                                    </p>
                                ))}

                                {section.title ===
                                '12. Contact Information' ? (
                                    <div className="mt-4 space-y-1 text-base leading-relaxed text-muted-foreground">
                                        <p>
                                            Email:{' '}
                                            <a
                                                href={`mailto:${company.email}`}
                                                className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                                            >
                                                {company.email}
                                            </a>
                                        </p>
                                        <p className="pt-2 font-medium text-foreground">
                                            Mailing Address:
                                        </p>
                                        <p>{company.name}</p>
                                        <p>{company.address}</p>
                                    </div>
                                ) : null}
                            </section>
                        ))}
                    </div>
                </article>
            </MarketShell>
        </>
    );
}
