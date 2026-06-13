import { Link } from '@inertiajs/react';
import { PrivatePageHead } from '@/components/seo/seo-head';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Congratulations() {
    return (
        <>
            <PrivatePageHead title="Welcome!" />

            <div className="flex flex-col gap-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-6" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">
                        Welcome to Web2Autos!
                    </h2>
                    <p className="text-base leading-relaxed text-muted-foreground">
                        Your account is all set. You can browse vehicles on the
                        marketplace, list your car anytime, or head to your
                        dashboard to get started.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">Browse Market</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/listings/create">List My Vehicle</Link>
                    </Button>
                    <Button asChild className="w-full">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

Congratulations.layout = {
    title: 'Account Created',
    description: 'Your Web2Autos account is ready',
};
