import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function Congratulations() {
    return (
        <>
            <Head title="Welcome!" />

            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="size-6" />
                    </div>
                    <CardTitle className="text-xl">
                        Welcome to Web2Autos!
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                        Your account is all set. You can browse vehicles on the
                        marketplace, list your car anytime, or head to your
                        dashboard to get started.
                    </CardDescription>
                </CardHeader>

                <CardContent />

                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild variant="outline">
                        <Link href="/">Browse Market</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/listings/create">List My Vehicle</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}

Congratulations.layout = {
    title: 'Account Created',
    description: 'Your Web2Autos account is ready',
};
