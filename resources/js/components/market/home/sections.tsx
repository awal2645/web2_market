import { Link } from '@inertiajs/react';
import {
    Car,
    ChevronRight,
    CreditCard,
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
        <section className="bg-background py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/50 p-3 shadow-sm sm:flex-row sm:items-stretch sm:gap-0 sm:p-2">
                    {categories.map((cat, i) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={cat.label}
                                href={cat.href}
                                className={`group flex flex-1 items-center gap-4 rounded-xl px-5 py-4 transition hover:bg-background hover:shadow-sm ${
                                    i > 0
                                        ? 'sm:border-l sm:border-border'
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
                                    <p className="text-base font-bold text-foreground">
                                        {cat.label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
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
        <section className="border-y border-border bg-background py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
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
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-sm">
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
                                            <h3 className="font-bold text-foreground">
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {i < steps.length - 1 && (
                                    <ChevronRight className="mx-2 hidden size-5 shrink-0 text-muted-foreground/50 lg:block" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

