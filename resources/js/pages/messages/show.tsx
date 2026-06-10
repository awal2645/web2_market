import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DeleteConversationMenuItem } from '@/components/messages/delete-conversation-dialog';
import { MessageBubble } from '@/components/messages/message-bubble';
import { MessageComposer } from '@/components/messages/message-composer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import type { Conversation, Message } from '@/types/messages';

type Props = {
    conversation: Conversation;
    messages: Message[];
};

const POLL_INTERVAL_MS = 5_000;

export default function MessagesShow({
    conversation,
    messages: initialMessages,
}: Props) {
    const getInitials = useInitials();
    const [messages, setMessages] = useState(initialMessages);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageIdRef = useRef(initialMessages.at(-1)?.id ?? 0);

    useEffect(() => {
        setMessages(initialMessages);
        lastMessageIdRef.current = initialMessages.at(-1)?.id ?? 0;
    }, [initialMessages]);

    useEffect(() => {
        lastMessageIdRef.current = messages.at(-1)?.id ?? 0;
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        let active = true;

        const poll = async () => {
            try {
                const response = await fetch(
                    `/messages/${conversation.id}/poll?after_id=${lastMessageIdRef.current}`,
                    {
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                    },
                );

                if (!response.ok || !active) {
                    return;
                }

                const data = (await response.json()) as {
                    messages: Message[];
                };

                if (data.messages.length > 0) {
                    setMessages((current) => {
                        const existingIds = new Set(
                            current.map((message) => message.id),
                        );
                        const incoming = data.messages.filter(
                            (message) => !existingIds.has(message.id),
                        );

                        return incoming.length > 0
                            ? [...current, ...incoming]
                            : current;
                    });
                }
            } catch {
                // Ignore polling errors silently.
            }
        };

        const interval = window.setInterval(poll, POLL_INTERVAL_MS);

        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [conversation.id]);

    const jumpToMessage = (messageId: number) => {
        document
            .getElementById(`message-${messageId}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <>
            <Head title={`Chat with ${conversation.other_user.name}`} />

            <div className="flex h-[calc(100vh-4rem)] flex-col">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/messages">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>

                    <Avatar className="size-10">
                        <AvatarImage
                            src={conversation.other_user.avatar ?? undefined}
                            alt={conversation.other_user.name}
                        />
                        <AvatarFallback>
                            {getInitials(conversation.other_user.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                            {conversation.other_user.name}
                        </p>
                        {conversation.listing && (
                            <Link
                                href={`/market/${conversation.listing.id}`}
                                className="truncate text-sm text-[#1565C0] hover:underline dark:text-[#90caf9]"
                            >
                                {conversation.listing.title}
                            </Link>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Conversation options"
                            >
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DeleteConversationMenuItem
                                conversationId={conversation.id}
                                otherUserName={conversation.other_user.name}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto py-4">
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                            Send a message to start the conversation.
                        </div>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                conversationId={conversation.id}
                                onReply={(target) => {
                                    setReplyingTo(target);
                                }}
                                onJumpToMessage={jumpToMessage}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <MessageComposer
                    conversationId={conversation.id}
                    replyTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                />
            </div>
        </>
    );
}
