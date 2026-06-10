import { MessageQuotedReply } from '@/components/messages/message-quoted-reply';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messages';

type Props = {
    message: Message;
    onCancel: () => void;
};

export function MessageReplyBar({ message, onCancel }: Props) {
    const replyPreview = {
        id: message.id,
        body:
            message.attachment_type === 'image'
                ? 'Photo'
                : message.attachment_type === 'voice'
                  ? 'Voice message'
                  : message.body,
        sender_name: message.is_mine ? 'You' : (message.sender_name ?? 'User'),
        attachment_type: message.attachment_type ?? null,
        is_mine: message.is_mine,
    };

    return (
        <div className="flex items-start gap-2 rounded-lg border border-[#1565C0]/30 bg-blue-50/50 px-3 py-2 dark:bg-blue-950/20">
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1565C0] dark:text-[#90caf9]">
                    Replying to {message.is_mine ? 'yourself' : message.sender_name}
                </p>
                <MessageQuotedReply
                    reply={replyPreview}
                    isMine={false}
                    className="mt-1 mb-0 border-[#1565C0] bg-white/80 dark:bg-background/80"
                />
            </div>
            <button
                type="button"
                onClick={onCancel}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
                Cancel
            </button>
        </div>
    );
}
