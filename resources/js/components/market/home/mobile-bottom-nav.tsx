import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    LayoutGrid,
    Menu,
    Plus,
    Search,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { MessageNavIcon } from '@/components/message-nav-icon';
import { MobileMenuSheet } from '@/components/market/home/mobile-menu-sheet';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import type { Auth } from '@/types';

type Props = {
    auth: Auth;
    listHref: string;
};

export function MobileBottomNav({ auth, listHref }: Props) {
    const { url } = usePage();
    const path = url.split('?')[0];

    const isActive = (href: string, exact = false) => {
        if (exact) {
            return path === href;
        }

        return path === href || path.startsWith(`${href}/`);
    };

    const items = [
        {
            label: 'Home',
            href: '/',
            icon: Home,
            exact: true,
            show: true,
        },
        {
            label: 'Browse',
            href: '/browse',
            icon: Search,
            exact: false,
            show: true,
        },
        {
            label: 'Add',
            href: listHref,
            icon: Plus,
            exact: false,
            show: true,
            primary: true,
        },
        {
            label: 'Messages',
            href: auth.user ? '/messages' : login(),
            icon: null,
            exact: false,
            show: true,
            isMessages: true,
        },
        {
            label: 'Menu',
            href: '#menu',
            icon: Menu,
            exact: false,
            show: true,
            isMenu: true,
        },
    ] as const;

    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <nav
                className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
                aria-label="Mobile navigation"
            >
                <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-end px-1">
                    {items.map((item) => {
                        if (item.isMenu) {
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => setMenuOpen(true)}
                                    className="flex flex-col items-center justify-center gap-1 pb-2 text-muted-foreground"
                                >
                                    <LayoutGrid className="size-5" />
                                    <span className="text-[10px] font-medium">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        }

                        if (item.isMessages) {
                            if (!auth.user) {
                                return (
                                    <Link
                                        key={item.label}
                                        href={login()}
                                        className="flex flex-col items-center justify-center gap-1 pb-2 text-muted-foreground"
                                    >
                                        <User className="size-5" />
                                        <span className="text-[10px] font-medium">
                                            Sign in
                                        </span>
                                    </Link>
                                );
                            }

                            return (
                                <div
                                    key={item.label}
                                    className={cn(
                                        'flex flex-col items-center justify-center gap-0.5 pb-2',
                                        isActive('/messages')
                                            ? 'text-[#1565C0]'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    <MessageNavIcon
                                        variant="ghost"
                                        className="size-9 p-0"
                                        iconClassName="size-5"
                                    />
                                    <span className="text-[10px] font-medium">
                                        Messages
                                    </span>
                                </div>
                            );
                        }

                        const Icon = item.icon!;
                        const active = isActive(item.href, item.exact);

                        if (item.primary) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="relative -top-3 flex flex-col items-center gap-0.5"
                                >
                                    <span className="flex size-12 items-center justify-center rounded-full bg-[#1565C0] text-white shadow-lg ring-4 ring-background">
                                        <Icon className="size-6" />
                                    </span>
                                    <span className="text-[10px] font-semibold text-[#1565C0]">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 pb-2',
                                    active
                                        ? 'text-[#1565C0]'
                                        : 'text-muted-foreground',
                                )}
                            >
                                <Icon className="size-5" />
                                <span className="text-[10px] font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <MobileMenuSheet
                open={menuOpen}
                onOpenChange={setMenuOpen}
                auth={auth}
                listHref={listHref}
            />
        </>
    );
}
