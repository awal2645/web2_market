import { Link } from '@inertiajs/react';
import { MapPin, Phone } from 'lucide-react';
import { company } from '@/data/company';

const columns = [
    {
        title: 'Buy',
        links: [
            { label: 'Browse Cars', href: '/browse' },
            { label: 'SUVs & Trucks', href: '/browse' },
            { label: 'Luxury Cars', href: '/browse' },
        ],
    },
    {
        title: 'Sell',
        links: [
            { label: 'Sell Your Car', href: '/register' },
            { label: 'Post a Listing', href: '/listings/create' },
            { label: 'My Listings', href: '/listings' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
        ],
    },
];

export function HomeFooter() {
    const year = new Date().getFullYear();

    return (
        <footer id="contact" className="border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-block transition hover:opacity-90">
                            <img
                                src="/images/web2autos-logo.png"
                                alt="Web2Autos.com"
                                className="h-11 w-auto"
                            />
                        </Link>
                        <p className="mt-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            {company.tagline}
                        </p>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Where buyers &amp; sellers meet. Buy, sell, and
                            finance vehicles in one place.
                        </p>
                    </div>

                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="mb-4 text-xs font-bold tracking-wider text-foreground uppercase">
                                {col.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-muted-foreground transition hover:text-[#1565C0]"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex gap-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-[#1565C0]" />
                        <div>
                            <p className="text-xs font-bold tracking-wider text-foreground uppercase">
                                Address
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {company.address}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Phone className="mt-0.5 size-4 shrink-0 text-[#1565C0]" />
                        <div>
                            <p className="text-xs font-bold tracking-wider text-foreground uppercase">
                                Direct (24/7)
                            </p>
                            <a
                                href={`tel:${company.directPhoneTel}`}
                                className="mt-1 block text-sm font-medium text-muted-foreground hover:text-[#1565C0]"
                            >
                                {company.directPhoneDisplay}
                            </a>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Phone className="mt-0.5 size-4 shrink-0 text-[#1565C0]" />
                        <div>
                            <p className="text-xs font-bold tracking-wider text-foreground uppercase">
                                Office
                            </p>
                            <a
                                href={`tel:${company.officePhoneTel}`}
                                className="mt-1 block text-sm font-medium text-muted-foreground hover:text-[#1565C0]"
                            >
                                {company.officePhoneDisplay}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 space-y-3 border-t border-border pt-6 text-center sm:text-left">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            &copy; {year} {company.name}. All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <Link href="/privacy" className="hover:text-[#1565C0]">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-[#1565C0]">
                                Terms of Service
                            </Link>
                            <Link href="/contact" className="hover:text-[#1565C0]">
                                Contact
                            </Link>
                            <a
                                href={company.deleteAccountUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#1565C0]"
                            >
                                Delete account
                            </a>
                        </div>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {company.legalDisclaimer}
                    </p>
                </div>
            </div>
        </footer>
    );
}
