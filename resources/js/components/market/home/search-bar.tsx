import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search } from 'lucide-react';

type FilterOptions = {
    makes: string[];
    models: string[];
    years: string[];
    prices: string[];
};

type Props = {
    filterOptions?: FilterOptions;
};

const defaultOptions: FilterOptions = {
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
};

export function HomeSearchBar({ filterOptions = defaultOptions }: Props) {
    const [make, setMake] = useState('Any Make');
    const [model, setModel] = useState('Any Model');
    const [year, setYear] = useState('Any Year');
    const [price, setPrice] = useState('Any Price');

    const search = (overrides: Record<string, string> = {}) => {
        router.get('/browse', {
            make: overrides.make ?? make,
            model: overrides.model ?? model,
            year: overrides.year ?? year,
            price: overrides.price ?? price,
            sort: 'newest',
        });
    };

    return (
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    search();
                }}
                className="-mt-2 mb-10 rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-5 lg:-mt-6"
            >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {(
                        [
                            ['Make', filterOptions.makes, make, setMake],
                            ['Model', filterOptions.models, model, setModel],
                            ['Year', filterOptions.years, year, setYear],
                            ['Price', filterOptions.prices, price, setPrice],
                        ] as const
                    ).map(([label, options, value, setter]) => (
                        <div key={label}>
                            <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">
                                {label}
                            </label>
                            <select
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                            >
                                {options.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1565C0] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0D47A1]"
                        >
                            <Search className="size-4" />
                            Search Cars
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <span className="text-xs font-medium text-muted-foreground">
                        Popular:
                    </span>
                    {['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'].map(
                        (makeName) => (
                            <button
                                key={makeName}
                                type="button"
                                onClick={() => {
                                    setMake(makeName);
                                    search({ make: makeName });
                                }}
                                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-blue-50 hover:text-[#1565C0] dark:hover:bg-blue-950/40 dark:hover:text-[#90caf9]"
                            >
                                {makeName}
                            </button>
                        ),
                    )}
                    <Link
                        href="/browse"
                        className="ml-auto text-xs font-semibold text-[#1565C0] hover:underline"
                    >
                        Advanced search →
                    </Link>
                </div>
            </form>
        </div>
    );
}
