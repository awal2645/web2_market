export type SellerProfile = {
    id: string;
    slug: string;
    name: string;
    is_dealer: boolean;
    avatar: string | null;
    member_since: string | null;
    average_rating: number | null;
    review_count: number;
    rating_distribution: Record<number, number>;
    active_listing_count: number;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    profile_url?: string;
};

export type SellerReview = {
    id: number;
    rating: number;
    body: string | null;
    reviewer_name: string;
    reviewer_avatar: string | null;
    listing_title: string | null;
    created_at: string | null;
};

export type SellerRatingStats = {
    average: number | null;
    count: number;
    distribution: Record<number, number>;
};
