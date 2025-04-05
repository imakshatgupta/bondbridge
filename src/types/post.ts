export interface MediaItem {
    url: string;
    type: string;
}

export interface PostProps {
    user: string;
    userId: string;
    avatar: string;
    caption: string;
    image?: string; // Made optional since we now support media array
    media?: MediaItem[]; // New property for multiple media items
    likes: number;
    comments: number;
    datePosted: string;
    isOwner?: boolean;
    onCommentClick?: () => void;
    onLikeClick?: () => void;
    feedId: string;
    isLiked?: boolean;
    onDelete?: (postId: string) => void; // Callback when post is deleted
}