import { cn } from '@/lib/utils';
import type { MessageReply } from '@/types/messages';

type Props = {
    reply: MessageReply;
    isMine: boolean;
    onClick?: () => void;
    className?: string;
};

export function MessageQuotedReply({
    reply,
    isMine,
    onClick,
    className,
}: Props) {
    const Wrapper = onClick ? 'button' : 'div';

    return (
        <Wrapper
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={cn(
                'mb-2 w-full rounded-lg border-l-4 px-3 py-2 text-left text-xs',
                isMine
                    ? 'border-white/80 bg-white/15 text-blue-50'
                    : 'border-[#1565C0] bg-muted/60 text-foreground',
                onClick && 'cursor-pointer transition hover:opacity-90',
                className,
            )}
        >
            <p
                className={cn(
                    'truncate font-semibold',
                    isMine ? 'text-white' : 'text-[#1565C0] dark:text-[#90caf9]',
                )}
            >
                {reply.is_mine ? 'You' : reply.sender_name}
            </p>
            <p className="mt-0.5 line-clamp-2 opacity-90">{reply.body}</p>
        </Wrapper>
    );
}
