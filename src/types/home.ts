import { CommentData } from '../apis/apiTypes/response';

export interface CommentsProps {
  postAuthor: string;
  postAvatar: string;
  postCaption: string;
  postLikes: number;
  postComments: number;
  postDate: string;
  comments: CommentData[];
}

export interface CommentProps {
  comment: CommentData;
  isReply?: boolean;
  postId?: string;
  currentUserId?: string; // Add current user ID to check ownership
  onCommentDeleted?: (commentId: string) => void; // Callback for parent components
}