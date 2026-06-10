import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

type Props = {
    conversationId: string;
    otherUserName: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onDeleted?: () => void;
};

export function DeleteConversationDialog({
    conversationId,
    otherUserName,
    trigger,
    open: controlledOpen,
    onOpenChange,
    onDeleted,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const open = controlledOpen ?? internalOpen;

    const setOpen = (value: boolean) => {
        if (onOpenChange) {
            onOpenChange(value);
        } else {
            setInternalOpen(value);
        }
    };

    const handleDelete = () => {
        setDeleting(true);

        router.delete(`/messages/${conversationId}`, {
            onSuccess: () => {
                setOpen(false);
                onDeleted?.();
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogTitle>Delete conversation?</DialogTitle>
                <DialogDescription>
                    This permanently deletes the entire conversation and all
                    messages for both you and {otherUserName}. This cannot be
                    undone.
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={deleting}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={deleting}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteConversationMenuItem({
    conversationId,
    otherUserName,
}: {
    conversationId: string;
    otherUserName: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(event) => {
                    event.preventDefault();
                    setOpen(true);
                }}
            >
                <Trash2 className="size-4" />
                Delete conversation
            </DropdownMenuItem>
            <DeleteConversationDialog
                conversationId={conversationId}
                otherUserName={otherUserName}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}
