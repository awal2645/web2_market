import { router } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const REASONS = [
    'Suspected fraud',
    'Incorrect information',
    'Vehicle already sold',
    'Offensive content',
    'Other',
] as const;

type Props = {
    listingSlug: string;
};

export function ListingReportDialog({ listingSlug }: Props) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>(REASONS[0]);
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = () => {
        setSubmitting(true);
        router.post(
            `/market/${listingSlug}/report`,
            { reason, details },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                    setOpen(false);
                    setDetails('');
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Flag className="size-4" />
                    Report listing
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report this listing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="report-reason">Reason</Label>
                        <select
                            id="report-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {REASONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="report-details">
                            Details (optional)
                        </Label>
                        <textarea
                            id="report-details"
                            rows={4}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Tell us what looks wrong..."
                        />
                    </div>
                    <Button
                        type="button"
                        className="w-full bg-[#1565C0] hover:bg-[#0D47A1]"
                        disabled={submitting}
                        onClick={submit}
                    >
                        Submit report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
