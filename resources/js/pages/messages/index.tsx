import { Head, Link, router } from '@inertiajs/react';
import { MessageSquare, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DeleteConversationDialog } from '@/components/messages/delete-conversation-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import type { Conversation } from '@/types/messages';

type Props = {
    conversations: Conversation[];
};

function formatRelativeTime(iso: string | null): string {
    if (!iso) {
        return '';
    }

    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60_000);

    if (diffMinutes < 1) {
        return 'Just now';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export default function MessagesIndex({ conversations }: Props) {
    const getInitials = useInitials();
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return conversations;
        }

        return conversations.filter((conversation) => {
            const haystack = [
                conversation.other_user.name,
                conversation.other_user.email,
                conversation.listing?.title ?? '',
                conversation.last_message?.body ?? '',
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalized);
        });
    }, [conversations, query]);

    return (
        <>
            <Head title="Messages" />

            <div className="flex h-[calc(100vh-4rem)] flex-col">
                <div className="border-b border-border px-1 pb-4">
                    <h1 className="text-2xl font-bold text-foreground">
                        Messages
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Chat with buyers and sellers about listings.
                    </p>
                    <div className="relative mt-4 max-w-md">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search conversations..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                            <MessageSquare className="size-7 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                {conversations.length === 0
                                    ? 'No messages yet'
                                    : 'No conversations match your search'}
                            </p>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                {conversations.length === 0
                                    ? 'Message a seller from a listing page to start a conversation.'
                                    : 'Try a different name, listing, or message text.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <ul className="divide-y divide-border overflow-y-auto">
                        {filtered.map((conversation) => (
                            <li key={conversation.id}>
                                <div className="group flex items-start gap-2 px-1 py-4 transition hover:bg-muted/40">
                                    <Link
                                        href={`/messages/${conversation.id}`}
                                        className="flex min-w-0 flex-1 items-start gap-3"
                                    >
                                        <Avatar className="size-11">
                                            <AvatarImage
                                                src={
                                                    conversation.other_user
                                                        .avatar ?? undefined
                                                }
                                                alt={
                                                    conversation.other_user.name
                                                }
                                            />
                                            <AvatarFallback>
                                                {getInitials(
                                                    conversation.other_user
                                                        .name,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-foreground">
                                                        {
                                                            conversation
                                                                .other_user.name
                                                        }
                                                    </p>
                                                    {conversation.listing && (
                                                        <p className="truncate text-xs text-[#1565C0] dark:text-[#90caf9]">
                                                            Re:{' '}
                                                            {
                                                                conversation
                                                                    .listing
                                                                    .title
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatRelativeTime(
                                                            conversation.last_message_at,
                                                        )}
                                                    </span>
                                                    {conversation.unread_count >
                                                        0 && (
                                                        <span className="flex size-5 items-center justify-center rounded-full bg-[#1565C0] text-[11px] font-semibold text-white">
                                                            {conversation.unread_count >
                                                            9
                                                                ? '9+'
                                                                : conversation.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                                {conversation.last_message
                                                    ?.body ?? 'No messages yet'}
                                            </p>
                                        </div>
                                    </Link>

                                    <DeleteConversationDialog
                                        conversationId={conversation.id}
                                        otherUserName={
                                            conversation.other_user.name
                                        }
                                        trigger={
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive focus:opacity-100"
                                                aria-label={`Delete conversation with ${conversation.other_user.name}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        }
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
