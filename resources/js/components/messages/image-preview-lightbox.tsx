import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    src: string;
    alt?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ImagePreviewLightbox({
    src,
    alt = 'Image preview',
    open,
    onOpenChange,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[min(95vw,1024px)] border-0 bg-black/90 p-2 shadow-none sm:max-w-[min(95vw,1024px)]">
                <DialogTitle className="sr-only">Image preview</DialogTitle>
                <DialogDescription className="sr-only">{alt}</DialogDescription>
                <img
                    src={src}
                    alt={alt}
                    className="mx-auto max-h-[85vh] w-full rounded-md object-contain"
                />
            </DialogContent>
        </Dialog>
    );
}
