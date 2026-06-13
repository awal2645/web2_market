import { router } from '@inertiajs/react';
import { MoreVertical, Pencil, Reply, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MessageQuotedReply } from '@/components/messages/message-quoted-reply';
import { ImagePreviewLightbox } from '@/components/messages/image-preview-lightbox';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { linkifyText } from '@/lib/linkify';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messages';

type Props = {
    message: Message;
    conversationId: string;
    onReply: (message: Message) => void;
    onJumpToMessage?: (messageId: number) => void;
};

function formatMessageTime(iso: string | null): string {
    if (!iso) {
        return '';
    }

    return new Date(iso).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function MessageBubble({
    message,
    conversationId,
    onReply,
    onJumpToMessage,
}: Props) {
    const [editOpen, setEditOpen] = useState(false);
    const [editBody, setEditBody] = useState(message.body);
    const [saving, setSaving] = useState(false);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

    const linkClass = message.is_mine
        ? 'underline break-all text-white hover:text-blue-100'
        : 'break-all text-[#1565C0] underline hover:text-[#0D47A1] dark:text-[#90caf9]';

    const deleteMessage = () => {
        if (!window.confirm('Permanently delete this message?')) {
            return;
        }

        router.delete(
            `/messages/${conversationId}/messages/${message.id}`,
            { preserveScroll: true },
        );
    };

    const saveEdit = () => {
        const trimmed = editBody.trim();

        if (!trimmed || saving) {
            return;
        }

        setSaving(true);

        router.patch(
            `/messages/${conversationId}/messages/${message.id}`,
            { body: trimmed },
            {
                preserveScroll: true,
                onSuccess: () => setEditOpen(false),
                onFinish: () => setSaving(false),
            },
        );
    };

    const canEdit = message.is_mine && message.attachment_type !== 'voice';
    const isImageOnly =
        message.attachment_type === 'image' &&
        (!message.body || message.body === 'Photo');

    return (
        <>
            <div
                id={`message-${message.id}`}
                className={cn(
                    'group flex max-w-[80%] items-start gap-1 scroll-mt-24',
                    message.is_mine ? 'ml-auto flex-row-reverse' : 'mr-auto',
                )}
            >
                <div
                    className={cn(
                        'min-w-0 rounded-2xl text-sm shadow-sm',
                        isImageOnly ? 'overflow-hidden p-1' : 'px-4 py-2.5',
                        message.is_mine
                            ? 'rounded-br-md bg-[#1565C0] text-white'
                            : 'rounded-bl-md border border-border bg-card text-foreground',
                    )}
                >
                    {message.reply_to && (
                        <MessageQuotedReply
                            reply={message.reply_to}
                            isMine={message.is_mine}
                            onClick={
                                onJumpToMessage
                                    ? () => onJumpToMessage(message.reply_to!.id)
                                    : undefined
                            }
                        />
                    )}

                    {message.attachment_type === 'image' &&
                        message.attachment_url && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setImagePreviewOpen(true)}
                                    className={cn(
                                        'block w-full overflow-hidden rounded-lg',
                                        !isImageOnly && 'mb-2',
                                    )}
                                    aria-label="View full image"
                                >
                                    <img
                                        src={message.attachment_url}
                                        alt="Shared image"
                                        className="max-h-64 w-full cursor-zoom-in object-cover transition hover:opacity-95"
                                    />
                                </button>
                                <ImagePreviewLightbox
                                    src={message.attachment_url}
                                    alt="Shared image"
                                    open={imagePreviewOpen}
                                    onOpenChange={setImagePreviewOpen}
                                />
                            </>
                        )}

                    {message.attachment_type === 'voice' &&
                        message.attachment_url && (
                            <div className="mb-2">
                                <audio
                                    controls
                                    preload="metadata"
                                    className="max-w-full"
                                    src={message.attachment_url}
                                >
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        )}

                    {message.body &&
                        !(
                            message.attachment_type === 'voice' &&
                            message.body === 'Voice message'
                        ) &&
                        !(
                            message.attachment_type === 'image' &&
                            message.body === 'Photo'
                        ) && (
                            <p className="whitespace-pre-wrap break-words">
                                {linkifyText(message.body, linkClass)}
                            </p>
                        )}

                    <div
                        className={cn(
                            'mt-1 flex items-center gap-2 text-[10px]',
                            isImageOnly && 'px-2 pb-1',
                            message.is_mine
                                ? 'text-blue-100'
                                : 'text-muted-foreground',
                        )}
                    >
                        <span>{formatMessageTime(message.created_at)}</span>
                        {message.edited_at && <span>· edited</span>}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                            aria-label="Message options"
                        >
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align={message.is_mine ? 'end' : 'start'}
                    >
                        <DropdownMenuItem
                            onSelect={() => onReply(message)}
                        >
                            <Reply className="size-4" />
                            Reply
                        </DropdownMenuItem>
                        {canEdit && (
                            <DropdownMenuItem
                                onSelect={() => {
                                    setEditBody(message.body);
                                    setEditOpen(true);
                                }}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </DropdownMenuItem>
                        )}
                        {message.is_mine && (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(event) => {
                                    event.preventDefault();
                                    deleteMessage();
                                }}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogTitle>Edit message</DialogTitle>
                    <DialogDescription>
                        Update your message text. Links will stay clickable.
                    </DialogDescription>
                    <textarea
                        value={editBody}
                        onChange={(event) => setEditBody(event.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        autoFocus
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={saving}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            disabled={saving || !editBody.trim()}
                            onClick={saveEdit}
                            className="bg-[#1565C0] hover:bg-[#0D47A1]"
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
