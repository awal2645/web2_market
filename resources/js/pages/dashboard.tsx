import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Car,
    CheckCircle2,
    Clock,
    Plus,
    Search,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatPrice } from '@/data/homepage';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';
import type { VehicleListing } from '@/types/market';

type Props = {
    stats: {
        total: number;
        approved: number;
        pending: number;
        rejected: number;
    };
    recentListings: VehicleListing[];
    recentActivity: {
        id: number;
        message: string;
        time: string;
        type: string;
    }[];
    emailVerified: boolean;
};

const statusStyles: Record<string, string> = {
    approved:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
    pending:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
    rejected:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
};

const activityIcon = {
    live: CheckCircle2,
    pending: Clock,
    rejected: XCircle,
};

export default function Dashboard({
    stats,
    recentListings,
    recentActivity,
    emailVerified,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';

    const statCards = [
        {
            label: 'Total Listings',
            value: stats.total,
            icon: Car,
            href: '/listings',
        },
        {
            label: 'Live',
            value: stats.approved,
            icon: CheckCircle2,
            href: '/listings',
        },
        {
            label: 'Pending Review',
            value: stats.pending,
            icon: Clock,
            href: '/listings',
        },
        {
            label: 'Not Approved',
            value: stats.rejected,
            icon: XCircle,
            href: '/listings',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#1565C0] dark:text-[#90caf9]">
                            Web2Autos Market
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Welcome back, {firstName}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your classified listings and track their
                            status.
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            variant="outline"
                            asChild
                        >
                            <Link href="/browse">
                                <Search />
                                Browse Cars
                            </Link>
                        </Button>
                        <Button
                            className="bg-[#1565C0] hover:bg-[#0D47A1]"
                            asChild
                        >
                            <Link href="/listings/create">
                                <Plus />
                                List a Vehicle
                            </Link>
                        </Button>
                    </div>
                </div>

                {!emailVerified && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
                        <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                Verify your email address
                            </p>
                            <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200">
                                Confirm your email to fully activate your seller
                                account.
                            </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/email/verify">
                                Verify now
                            </Link>
                        </Button>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link key={stat.label} href={stat.href}>
                                <Card className="gap-4 py-5 shadow-sm transition hover:border-[#1565C0]/30 hover:shadow-md">
                                    <CardContent className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {stat.label}
                                            </p>
                                            <p className="mt-1 text-2xl font-bold text-foreground">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#1565C0]/10 dark:bg-[#1565C0]/20">
                                            <Icon className="size-5 text-[#1565C0] dark:text-[#90caf9]" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="gap-0 py-0 shadow-sm lg:col-span-2">
                        <CardHeader className="border-b border-border py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">
                                        Recent Listings
                                    </CardTitle>
                                    <CardDescription>
                                        Your latest classified ads
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#1565C0] hover:bg-blue-50 dark:text-[#90caf9] dark:hover:bg-blue-950/40"
                                    asChild
                                >
                                    <Link href="/listings">
                                        View all
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentListings.length === 0 ? (
                                <div className="px-5 py-10 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        You haven&apos;t listed any vehicles
                                        yet.
                                    </p>
                                    <Button
                                        className="mt-4 bg-[#1565C0] hover:bg-[#0D47A1]"
                                        asChild
                                    >
                                        <Link href="/listings/create">
                                            Create your first listing
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {recentListings.map((listing) => (
                                        <div
                                            key={listing.id}
                                            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                                        >
                                            <img
                                                src={
                                                    listing.images[0]?.url ??
                                                    '/images/demo-vehicles/car-2.jpg'
                                                }
                                                alt={listing.title}
                                                className="size-20 shrink-0 rounded-lg object-cover ring-1 ring-border"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-foreground">
                                                        {listing.title}
                                                    </h3>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            statusStyles[
                                                                listing.status
                                                            ] ??
                                                            statusStyles.pending
                                                        }
                                                    >
                                                        {listing.status_label}
                                                    </Badge>
                                                </div>
                                                <p className="mt-0.5 text-lg font-bold text-[#1565C0] dark:text-[#90caf9]">
                                                    {formatPrice(
                                                        listing.asking_price,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {listing.mileage.toLocaleString()}{' '}
                                                    mi · {listing.drivetrain}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="shrink-0"
                                                asChild
                                            >
                                                <Link
                                                    href={`/market/${listing.id}`}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0 shadow-sm">
                        <CardHeader className="border-b border-border py-5">
                            <CardTitle className="text-base">
                                Listing Activity
                            </CardTitle>
                            <CardDescription>
                                Status updates on your ads
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentActivity.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                                    No activity yet.
                                </p>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {recentActivity.map((item) => {
                                        const Icon =
                                            activityIcon[
                                                item.type as keyof typeof activityIcon
                                            ] ?? Clock;
                                        return (
                                            <li
                                                key={item.id}
                                                className="flex gap-3 px-5 py-4"
                                            >
                                                <Icon className="mt-0.5 size-4 shrink-0 text-[#1565C0] dark:text-[#90caf9]" />
                                                <div className="min-w-0">
                                                    <p className="text-sm text-foreground">
                                                        {item.message}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {item.time}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
