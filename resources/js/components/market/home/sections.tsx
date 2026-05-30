import { Link } from '@inertiajs/react';
import {
    Car,
    ChevronRight,
    CreditCard,
    Star,
    Truck,
    User,
} from 'lucide-react';

const categories = [
    {
        label: 'SUVs',
        subtitle: 'Explore SUVs',
        href: '/browse',
        icon: Car,
    },
    {
        label: 'Sedans',
        subtitle: 'Browse Sedans',
        href: '/browse',
        icon: Car,
    },
    {
        label: 'Trucks',
        subtitle: 'Power & Capability',
        href: '/browse',
        icon: Truck,
    },
    {
        label: 'Luxury',
        subtitle: 'Premium Vehicles',
        href: '/browse',
        icon: Car,
    },
];

export function CategoriesSection() {
    return (
        <section className="bg-white py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm sm:flex-row sm:items-stretch sm:gap-0 sm:p-2">
                    {categories.map((cat, i) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={cat.label}
                                href={cat.href}
                                className={`group flex flex-1 items-center gap-4 rounded-xl px-5 py-4 transition hover:bg-white hover:shadow-sm ${
                                    i > 0
                                        ? 'sm:border-l sm:border-gray-200'
                                        : ''
                                }`}
                            >
                                <div className="flex size-12 shrink-0 items-center justify-center">
                                    <Icon
                                        className="size-9 text-[#1565C0]"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-base font-bold text-gray-900">
                                        {cat.label}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {cat.subtitle}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

const steps = [
    {
        n: 1,
        title: 'Find Your Car',
        desc: 'Search thousands of listings that match your needs.',
        icon: Car,
    },
    {
        n: 2,
        title: 'Connect & Buy',
        desc: 'Contact sellers or dealers and close the deal with ease.',
        icon: User,
    },
    {
        n: 3,
        title: 'Get Financed',
        desc: 'Get pre-approved and drive off with confidence.',
        icon: CreditCard,
    },
];

export function HowItWorksSection() {
    return (
        <section className="border-y border-gray-100 bg-white py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    How It Works
                </h2>

                <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-0">
                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.n}
                                className="flex flex-1 items-center gap-0"
                            >
                                <div className="flex flex-1 items-start gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                                        <Icon
                                            className="size-6 text-[#1565C0]"
                                            strokeWidth={1.75}
                                        />
                                    </div>
                                    <div className="flex items-start gap-2 pt-0.5">
                                        <span className="text-3xl leading-none font-bold text-[#1565C0]">
                                            {step.n}
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-gray-900">
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 max-w-[220px] text-sm leading-relaxed text-gray-500">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {i < steps.length - 1 && (
                                    <ChevronRight className="mx-2 hidden size-5 shrink-0 text-gray-300 lg:block" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function StarRow({ count = 5 }: { count?: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
                <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                />
            ))}
        </div>
    );
}

export function TestimonialsSection() {
    return (
        <section className="bg-gray-50 py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-5 lg:grid-cols-12">
                    {/* Testimonial — spans 7 cols */}
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:flex-row lg:col-span-7">
                        <div className="flex flex-1 flex-col justify-center p-8">
                            <h2 className="text-lg font-bold text-gray-900">
                                What Our Customers Say
                            </h2>
                            <div className="mt-5 flex gap-3">
                                <span className="text-4xl leading-none font-serif text-[#1565C0]">
                                    &ldquo;
                                </span>
                                <p className="text-base leading-relaxed text-gray-600">
                                    Web2Autos made it so easy to find the right
                                    car and get financed quickly. Highly
                                    recommend!
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-3">
                                <p className="text-sm font-semibold text-gray-900">
                                    — Jessica M.
                                </p>
                                <StarRow />
                            </div>
                        </div>
                        <div className="relative h-48 shrink-0 sm:h-auto sm:w-44 lg:w-52">
                            <img
                                src="/images/testimonial-jessica.jpg"
                                alt="Jessica M."
                                className="size-full object-cover object-top"
                            />
                        </div>
                    </div>

                    {/* Trustpilot */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex items-center gap-1.5">
                            <Star className="size-5 fill-[#00B67A] text-[#00B67A]" />
                            <span className="text-lg font-bold text-gray-900">
                                Trustpilot
                            </span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-gray-900">
                            4.7
                        </p>
                        <div className="mt-2">
                            <StarRow />
                        </div>
                    </div>

                    {/* BBB */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-14 items-center justify-center rounded-lg bg-[#005A78] text-xs font-bold text-white">
                                BBB
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-[#005A78]">
                                    Accredited
                                </p>
                                <p className="text-sm font-bold text-[#005A78]">
                                    Business
                                </p>
                            </div>
                            <div className="flex size-14 items-center justify-center rounded-full border-4 border-[#005A78] text-xl font-extrabold text-[#005A78]">
                                A+
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            Better Business Bureau
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
