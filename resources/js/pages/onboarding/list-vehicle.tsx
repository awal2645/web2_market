import { Form, Head, Link } from '@inertiajs/react';
import { CarFront } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ListVehiclePrompt() {
    return (
        <>
            <Head title="List Your Vehicle" />

            <div className="flex flex-col gap-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CarFront className="size-6" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">
                        List on Web2Autos Market?
                    </h2>
                    <p className="text-base leading-relaxed text-muted-foreground">
                        Do you want to list your car on Web2Autos Market? Sell
                        your vehicle at your own price, often better than
                        trade-in offers. Web2Autos will help take care of the
                        paperwork for a worry-free selling experience.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Form
                        action="/onboarding/skip"
                        method="post"
                        className="w-full sm:flex-1"
                    >
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full"
                        >
                            Skip
                        </Button>
                    </Form>

                    <Button asChild className="w-full sm:flex-1">
                        <Link href="/listings/create">Continue</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

ListVehiclePrompt.layout = {
    title: 'Welcome to Web2Autos',
    description: 'Get started with your new account',
};
