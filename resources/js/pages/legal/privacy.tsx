import { Link, usePage } from '@inertiajs/react';
import { MarketShell } from '@/components/market/home/market-shell';
import { SeoHead } from '@/components/seo/seo-head';
import { company } from '@/data/company';
import {
    PRIVACY_LAST_UPDATED,
    PRIVACY_SECTIONS,
} from '@/data/legal/privacy-policy';
import { register } from '@/routes';
import type { Auth } from '@/types';

function sectionId(title: string): string {
    return title.replace(/\s+/g, '-').toLowerCase();
}

export default function PrivacyPolicyPage() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : register.url();

    return (
        <>
            <SeoHead
                title="Privacy Policy"
                description="Web2Autos Privacy Policy — how we collect, use, and protect your information."
                path="/privacy"
            />

            <MarketShell auth={auth} listHref={listHref}>
                <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                        Last updated: {PRIVACY_LAST_UPDATED}
                    </p>

                    <div className="mt-10 space-y-10">
                        {PRIVACY_SECTIONS.map((section) => (
                            <section
                                key={section.title}
                                aria-labelledby={sectionId(section.title)}
                            >
                                <h2
                                    id={sectionId(section.title)}
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

                                {section.linkParagraph ? (
                                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                                        {section.linkParagraph.before}
                                        <a
                                            href={section.linkParagraph.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                                        >
                                            {section.linkParagraph.linkLabel}
                                        </a>
                                        {section.linkParagraph.after}
                                    </p>
                                ) : null}
                            </section>
                        ))}

                        <section aria-labelledby="privacy-contact">
                            <h2
                                id="privacy-contact"
                                className="text-xl font-bold text-foreground sm:text-2xl"
                            >
                                Contact us
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                                For privacy-related questions, contact us at{' '}
                                <a
                                    href={`mailto:${company.email}`}
                                    className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                                >
                                    {company.email}
                                </a>{' '}
                                or {company.address}.
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Also see our{' '}
                                <Link
                                    href="/contact"
                                    className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                                >
                                    Contact
                                </Link>{' '}
                                page and{' '}
                                <Link
                                    href="/terms"
                                    className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                                >
                                    Terms of Service
                                </Link>
                                .
                            </p>
                        </section>
                    </div>
                </article>
            </MarketShell>
        </>
    );
}
