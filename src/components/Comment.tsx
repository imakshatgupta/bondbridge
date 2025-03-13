import { useState, useCallback, memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Reply, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import ThreeDotsMenu from "@/components/global/ThreeDotsMenu";
import toast from 'react-hot-toast';
const apiUrl = import.meta.env.VITE_API_URL;

interface CommentData {
  id: number;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  timeAgo: string;
  replies?: CommentData[];
  hasReplies?: boolean;
  userId?: string; // Add userId to identify comment owner
}

interface CommentProps {
  comment: CommentData;
  isReply?: boolean;
  postId?: number; // Add postId for API calls
  currentUserId?: string; // Add current user ID to check ownership
  onCommentDeleted?: (commentId: number) => void; // Callback for parent components
}

// Memoized reply component to prevent unnecessary re-renders
const ReplyComment = memo(({ comment, postId, currentUserId, onCommentDeleted }: 
  { comment: CommentData; postId?: number; currentUserId?: string; onCommentDeleted?: (commentId: number) => void }) => (
  <Comment 
    comment={comment} 
    isReply={true} 
    postId={postId} 
    currentUserId={currentUserId}
    onCommentDeleted={onCommentDeleted}
  />
));
ReplyComment.displayName = 'ReplyComment';

export function Comment({ comment, isReply = false, postId, currentUserId, onCommentDeleted }: CommentProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCommentOwner = currentUserId && comment.userId === currentUserId;

  const formattedLikes = comment.likes >= 1000
    ? `${(comment.likes / 1000).toFixed(1)}k`
    : comment.likes.toString();

  // Memoize handlers to prevent recreation on each render
  const toggleReplies = useCallback(() => setShowReplies(prev => !prev), []);
  const toggleLiked = useCallback(() => setLiked(prev => !prev), []);
  const toggleReplyInput = useCallback(() => setShowReplyInput(prev => !prev), []);

  const handleReplyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
  }, []);

  const handleAddReply = useCallback(() => {
    if (replyText.trim()) {
      const newReply: CommentData = {
        id: Date.now(),
        user: "Anonymous one",
        avatar: "/path/to/avatar.jpg",
        content: replyText,
        likes: 0,
        timeAgo: "Just now",
        hasReplies: false
      };

      setReplies(prev => [...prev, newReply]);
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);
    }
  }, [replyText]);

  const handleDeleteComment = useCallback(async () => {
    if (!postId) {
      toast.error("Cannot delete comment: missing post ID");
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`${apiUrl}/comment`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': currentUserId || '',
          'token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify({
          commentId: comment.id,
          postId: postId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete comment');
      }

      toast.success("Comment deleted successfully");

      // Notify parent component about deletion
      if (onCommentDeleted) {
        onCommentDeleted(comment.id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  }, [comment.id, postId, currentUserId, onCommentDeleted]);

  const handleDeleteCommentDummy = () => {
    if (onCommentDeleted) {
      onCommentDeleted(comment.id);
    }
    toast.success("Comment deleted successfully");
  }

  // Early return for empty content
  if (!comment.content) return null;

  return (
    <div className={`p-4 ${isReply ? "pl-12" : ""}`}>
      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.avatar} alt={comment.user} />
          <AvatarFallback>{comment.user[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user}</span>
                <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>

              {comment.content.length > 100 && (
                <button className="text-primary text-xs mt-1">Read more</button>
              )}

              <div className="flex items-center gap-4 mt-2">
                {(replies.length > 0 || comment.hasReplies) && (
                  <button
                    className="text-xs text-muted-foreground"
                    onClick={toggleReplies}
                  >
                    {showReplies ? "Hide Replies" : `${replies.length || '2k'} Replies`}
                  </button>
                )}
              </div>
            </div>

            <ThreeDotsMenu
              showDelete={true}
              onShare={() => console.log('Share clicked')}
              onReport={() => console.log('Report clicked')}
              onDelete={() => console.log('Delete clicked')}
            />
          </div>

          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={toggleLiked}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? "text-destructive fill-destructive" : ""}`} />
              {formattedLikes}
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={toggleReplies}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {replies.length || 0}
              </Button>
            )}

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={toggleReplyInput}
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {showReplyInput && (
            <div className="mt-2 relative">
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={handleReplyChange}
                className="rounded-full bg-muted pr-12"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-primary"
                disabled={!replyText.trim()}
                onClick={handleAddReply}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Optimized replies rendering with memoized component */}
          {showReplies && replies.length > 0 && (
            <div className="mt-2">
              {replies.map(reply => (
                <ReplyComment 
                  key={reply.id} 
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  onCommentDeleted={(replyId) => {
                    setReplies(prev => prev.filter(r => r.id !== replyId));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export a memoized version of the component
export default memo(Comment);