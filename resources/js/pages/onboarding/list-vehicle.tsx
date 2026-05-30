import { Form, Head, Link } from '@inertiajs/react';
import { CarFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function ListVehiclePrompt() {
    return (
        <>
            <Head title="List Your Vehicle" />

            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CarFront className="size-6" />
                    </div>
                    <CardTitle className="text-xl">
                        List on Web2Autos Market?
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                        Do you want to list your car on Web2Autos Market? Sell
                        your vehicle at your own price, often better than
                        trade-in offers. Web2Autos will help take care of the
                        paperwork for a worry-free selling experience.
                    </CardDescription>
                </CardHeader>

                <CardContent />

                <CardFooter className="flex flex-col gap-3 sm:flex-row">
                    <Form action="/onboarding/skip" method="post" className="w-full sm:w-auto">
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full sm:min-w-32"
                        >
                            Skip
                        </Button>
                    </Form>

                    <Button asChild className="w-full sm:min-w-32">
                        <Link href="/listings/create">Continue</Link>
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}

ListVehiclePrompt.layout = {
    title: 'Welcome to Web2Autos',
    description: 'Get started with your new account',
};
