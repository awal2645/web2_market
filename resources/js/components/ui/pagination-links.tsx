import { Link } from '@inertiajs/react';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

type Props = {
    links: PaginationLink[];
    lastPage: number;
    className?: string;
};

export function PaginationLinks({ links, lastPage, className }: Props) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <nav
            className={`flex flex-wrap justify-center gap-1 ${className ?? ''}`}
        >
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url ?? '#'}
                    preserveScroll
                    className={`rounded-md px-3 py-1.5 text-sm ${
                        link.active
                            ? 'bg-[#1565C0] text-white'
                            : link.url
                              ? 'bg-card text-foreground ring-1 ring-border hover:bg-muted/50'
                              : 'cursor-not-allowed text-muted-foreground/50'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </nav>
    );
}
