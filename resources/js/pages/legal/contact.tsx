import { Link, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { MarketShell } from '@/components/market/home/market-shell';
import { SeoHead } from '@/components/seo/seo-head';
import { company } from '@/data/company';
import { register } from '@/routes';
import type { Auth } from '@/types';

export default function ContactPage() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const listHref = auth.user ? '/listings/create' : register.url();

    return (
        <>
            <SeoHead
                title="Contact Us"
                description="Contact Web2Autos — address, sales hotline, and support phone numbers."
                path="/contact"
            />

            <MarketShell auth={auth} listHref={listHref}>
                <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Contact Us
                    </h1>
                    <p className="mt-3 text-base text-muted-foreground">
                        Same contact details as{' '}
                        <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                        >
                            web2autos.com
                        </a>
                        . Reach us anytime — we&apos;re here to help.
                    </p>

                    <div className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                        <div className="flex gap-3">
                            <MapPin className="mt-0.5 size-5 shrink-0 text-[#1565C0]" />
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    Address
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    {company.name}
                                    <br />
                                    {company.address}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Phone className="mt-0.5 size-5 shrink-0 text-[#1565C0]" />
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    Direct (24/7)
                                </p>
                                <a
                                    href={`tel:${company.directPhoneTel}`}
                                    className="mt-1 block text-sm font-semibold text-[#1565C0] hover:underline"
                                >
                                    {company.directPhoneDisplay}
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Phone className="mt-0.5 size-5 shrink-0 text-[#1565C0]" />
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    Office / Sales hotline
                                </p>
                                <a
                                    href={`tel:${company.officePhoneTel}`}
                                    className="mt-1 block text-sm font-semibold text-[#1565C0] hover:underline"
                                >
                                    {company.officePhoneDisplay}
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Mail className="mt-0.5 size-5 shrink-0 text-[#1565C0]" />
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    Email
                                </p>
                                <a
                                    href={`mailto:${company.email}`}
                                    className="mt-1 block text-sm font-semibold text-[#1565C0] hover:underline"
                                >
                                    {company.email}
                                </a>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-muted-foreground">
                        Read our{' '}
                        <Link
                            href="/privacy"
                            className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                        >
                            Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link
                            href="/terms"
                            className="font-semibold text-[#1565C0] underline-offset-2 hover:underline"
                        >
                            Terms of Service
                        </Link>
                        .
                    </p>
                </div>
            </MarketShell>
        </>
    );
}
