import { Link, usePage } from '@inertiajs/react';
import { CarFront, LayoutGrid, List, ShieldCheck } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Auth, NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'My Listings',
            href: '/listings',
            icon: List,
        },
        {
            title: 'Sell Vehicle',
            href: '/listings/create',
            icon: CarFront,
        },
    ];

    if (auth.user?.is_admin) {
        mainNavItems.push({
            title: 'Admin Listings',
            href: '/admin/listings',
            icon: ShieldCheck,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="px-3 py-3">
                <Link
                    href={dashboard()}
                    prefetch
                    className="flex w-full items-center overflow-visible transition hover:opacity-90"
                >
                    <AppLogo className="h-auto w-full max-h-16 object-contain object-left group-data-[collapsible=icon]:max-h-8" />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
