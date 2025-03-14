import { useState, useCallback, memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Reply, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import ThreeDotsMenu from "@/components/global/ThreeDotsMenu";
import toast from 'react-hot-toast';
import { useApiCall } from "@/apis/globalCatchError";
import { CommentData } from "../apis/apiTypes/response";
import { CommentProps } from "../types/home";
import { deleteComment } from "@/apis/commonApiCalls/commentsApi";

// Memoized reply component to prevent unnecessary re-renders
const ReplyComment = memo(({ comment, postId, currentUserId, postAuthorId, onCommentDeleted, isPending }: 
  { comment: CommentData & { likes?: number; hasReplies?: boolean }; postId?: string; currentUserId?: string; postAuthorId?: string; onCommentDeleted?: (commentId: string) => void; isPending?: boolean }) => (
  <Comment 
    comment={comment} 
    isReply={true} 
    postId={postId} 
    currentUserId={currentUserId}
    postAuthorId={postAuthorId}
    onCommentDeleted={onCommentDeleted}
    isPending={isPending}
  />
));
ReplyComment.displayName = 'ReplyComment';

export function Comment({ comment, isReply = false, postId, currentUserId, postAuthorId, onCommentDeleted, isPending = false }: CommentProps) {
  // Check if the comment is pending based on its ID (starts with 'temp-')
  const isCommentPending = isPending || comment.commentId.startsWith('temp-');
  
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<CommentData[]>([]);
  
  // Check if current user is the comment owner
  const isCommentOwner = (currentUserId && comment.user.userId === currentUserId);
  
  // Check if current user is the post owner
  const isPostOwner = (currentUserId && postAuthorId && currentUserId === postAuthorId);
  
  // Show delete option if user is either comment owner or post owner
  const canDelete = isCommentOwner || isPostOwner;
  
  // Use the useApiCall hook for the delete comment API
  const [executeDeleteComment] = useApiCall(deleteComment);

  // Default likes to 0 if not provided
  const likes = comment.likes || 0;
  const formattedLikes = likes >= 1000
    ? `${(likes / 1000).toFixed(1)}k`
    : likes.toString();

  // Memoize handlers to prevent recreation on each render
  const toggleReplies = useCallback(() => setShowReplies(prev => !prev), []);
  
  // Update the toggleLiked function to also update the likes count
  const [likeCount, setLikeCount] = useState(likes);
  const toggleLiked = useCallback(() => {
    // First update the liked state
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    // Then update the like count based on the new liked state
    if (newLikedState) {
      setLikeCount(prev => prev + 1);
    } else {
      setLikeCount(prev => prev - 1);
    }
  }, [liked]); // Add liked as a dependency
  
  // Format like count for display
  const formattedLikeCount = likeCount >= 1000
    ? `${(likeCount / 1000).toFixed(1)}k`
    : likeCount.toString();

  const toggleReplyInput = useCallback(() => setShowReplyInput(prev => !prev), []);

  const handleReplyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
  }, []);

  const handleAddReply = useCallback(() => {
    if (replyText.trim()) {
      const newReply: CommentData = {
        commentId: `temp-${Date.now()}`,
        postId: postId || "",
        parentComment: comment.commentId,
        comment: replyText,
        createdAt: new Date().toISOString(),
        agoTime: "Just now",
        user: {
          userId: currentUserId || "anonymous",
          name: "Anonymous one",
          profilePic: "/path/to/avatar.jpg"
        },
        likes: 0,
        hasReplies: false
      };

      // Optimistically add the reply
      setReplies(prev => [...prev, newReply]);
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);
      
      // TODO: Implement API call to post reply
      // If API call fails, you could remove the optimistically added reply
      // and show an error message
    }
  }, [replyText, postId, comment.commentId, currentUserId]);

  const handleDeleteComment = useCallback(async () => {
    // For temporary comments (optimistically added), just remove them without API call
    if (isCommentPending) {
      if (onCommentDeleted) {
        onCommentDeleted(comment.commentId);
      }
      return;
    }
    
    if (!postId) {
      toast.error("Cannot delete comment: missing post ID");
      return;
    }

    const { success } = await executeDeleteComment(comment.commentId, postId);
    
    if (success) {
      // Notify parent component about deletion
      if (onCommentDeleted) {
        onCommentDeleted(comment.commentId);
      }
    }
  }, [comment.commentId, postId, onCommentDeleted, executeDeleteComment, isCommentPending]);

  // Early return for empty content
  if (!comment.comment) return null;

  return (
    <div className={`p-4 ${isReply ? "pl-12" : ""} ${isCommentPending ? "opacity-70" : ""}`}>
      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.profilePic} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user.name}</span>
                <span className="text-xs text-muted-foreground">{comment.agoTime}</span>
                {isCommentPending && (
                  <span className="text-xs text-muted-foreground italic">Sending...</span>
                )}
              </div>
              <p className="text-sm mt-1">{comment.comment}</p>

              {comment.comment.length > 100 && (
                <button className="text-primary text-xs mt-1">Read more</button>
              )}

              <div className="flex items-center gap-4 mt-2">
                {(replies.length > 0 || comment.hasReplies) && (
                  <button
                    className="text-xs text-muted-foreground"
                    onClick={toggleReplies}
                  >
                    {showReplies ? "Hide Replies" : `${replies.length || '0'} Replies`}
                  </button>
                )}
              </div>
            </div>

            <ThreeDotsMenu
              showDelete={!!canDelete}
              onShare={() => console.log('Share clicked')}
              onReport={() => console.log('Report clicked')}
              onDelete={handleDeleteComment}
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
              {formattedLikeCount}
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
                  key={reply.commentId} 
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  postAuthorId={postAuthorId}
                  onCommentDeleted={(replyId) => {
                    setReplies(prev => prev.filter(r => r.commentId !== replyId));
                  }}
                  isPending={reply.commentId.startsWith('temp-')}
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