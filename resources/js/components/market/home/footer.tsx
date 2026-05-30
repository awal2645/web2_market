import { Link } from '@inertiajs/react';

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
            { label: 'About Us', href: '#' },
            { label: 'Contact', href: '#' },
            { label: 'Help Center', href: '#' },
        ],
    },
];

export function HomeFooter() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-block transition hover:opacity-90">
                            <img
                                src="/images/web2autos-logo.png"
                                alt="Web2Autos.com"
                                className="h-11 w-auto"
                            />
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
                            Where buyers &amp; sellers meet. Buy, sell, and
                            finance vehicles in one place.
                        </p>
                    </div>

                    {/* Link columns */}
                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="mb-4 text-xs font-bold tracking-wider text-gray-900 uppercase">
                                {col.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-600 transition hover:text-[#1565C0]"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Web2Autos.com. All
                        rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link href="#" className="hover:text-[#1565C0]">
                            Privacy
                        </Link>
                        <Link href="#" className="hover:text-[#1565C0]">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
