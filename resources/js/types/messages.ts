export type MessageUser = {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
};

export type MessageReply = {
    id: number;
    body: string;
    sender_name: string;
    attachment_type?: 'image' | 'voice' | null;
    is_mine: boolean;
};

export type Message = {
    id: number;
    body: string;
    sender_id: string;
    sender_name?: string;
    is_mine: boolean;
    attachment_type?: 'image' | 'voice' | null;
    attachment_url?: string | null;
    reply_to?: MessageReply | null;
    read_at: string | null;
    edited_at?: string | null;
    created_at: string | null;
};

export type ConversationListing = {
    id: number;
    title: string;
};

export type Conversation = {
    id: string;
    other_user: MessageUser;
    listing: ConversationListing | null;
    last_message: Message | null;
    unread_count: number;
    last_message_at: string | null;
    updated_at: string | null;
};
