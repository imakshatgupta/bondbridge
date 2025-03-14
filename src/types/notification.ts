export type NotificationType = {
    id: number;
    title: string;
    description: string;
    avatar: string;
    timestamp: Date;
    seen: boolean;
};
  
export type FriendRequestType = {
    requestId: number;
    name: string;
    bio: string;
    avatar: string;
};

export type FriendRequestProps = {
    avatar: string;
    name: string;
    bio: string;
    requestId: number;
    userId?: string;
    onAcceptSuccess?: (requestId: number) => void;
    onRejectSuccess?: (requestId: number) => void;
};