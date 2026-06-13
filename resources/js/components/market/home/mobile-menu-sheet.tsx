import { Link } from '@inertiajs/react';
import {
    Car,
    Heart,
    Landmark,
    LayoutGrid,
    MessageSquare,
    Plus,
    Search,
    User,
} from 'lucide-react';
import { MessageNavIcon } from '@/components/message-nav-icon';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { dashboard, login } from '@/routes';
import type { Auth } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    auth: Auth;
    listHref: string;
};

const links = [
    { label: 'Browse cars', href: '/browse', icon: Search },
    { label: 'Auto loans', href: '/#finance', icon: Landmark },
    { label: 'Saved listings', href: '/browse', icon: Heart },
    { label: 'My listings', href: '/listings', icon: Car, auth: true },
    { label: 'Messages', href: '/messages', icon: MessageSquare, auth: true },
    { label: 'Post your car', href: null, icon: Plus, highlight: true },
];

export function MobileMenuSheet({
    open,
    onOpenChange,
    auth,
    listHref,
}: Props) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
                <SheetHeader className="text-left">
                    <SheetTitle className="flex items-center gap-2">
                        <LayoutGrid className="size-5 text-[#1565C0]" />
                        Menu
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-4 grid gap-1">
                    {links.map((link) => {
                        if (link.auth && !auth.user) {
                            return null;
                        }

                        const href =
                            link.label === 'Post your car'
                                ? listHref
                                : link.href!;

                        return (
                            <Link
                                key={link.label}
                                href={href}
                                onClick={() => onOpenChange(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                                    link.highlight
                                        ? 'bg-[#1565C0] text-white'
                                        : 'text-foreground hover:bg-muted'
                                }`}
                            >
                                <link.icon className="size-5 shrink-0" />
                                {link.label}
                            </Link>
                        );
                    })}

                    <div className="my-2 border-t border-border" />

                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            onClick={() => onOpenChange(false)}
                            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            <User className="size-5" />
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={login()}
                            onClick={() => onOpenChange(false)}
                            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            <User className="size-5" />
                            Sign in
                        </Link>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function MobileHeaderActions({ auth }: { auth: Auth }) {
    return (
        <div className="flex items-center gap-1 md:hidden">
            <MessageNavIcon
                variant="ghost"
                className="size-10 rounded-xl border border-border bg-muted/40"
            />
            {!auth.user && (
                <Link
                    href={login()}
                    className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground"
                    aria-label="Sign in"
                >
                    <User className="size-5" />
                </Link>
            )}
        </div>
    );
}
