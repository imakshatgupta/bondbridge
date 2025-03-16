import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Comment } from "@/components/Comment";
import { Post } from "@/components/Post";
import { Input } from "@/components/ui/input";
import avatarImage from "/profile/user.png";
import { fetchComments, postComment } from "@/apis/commonApiCalls/commentsApi";
import { useApiCall } from "@/apis/globalCatchError";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { CommentData, HomePostData } from "@/apis/apiTypes/response";
import { toast } from "react-hot-toast";

export default function CommentsPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const location = useLocation();
  const { postData } = location.state as { postData: HomePostData };
  const [post, setpost] = useState<HomePostData>(postData);
  const [newComment, setNewComment] = useState("");
  const [commentsData, setCommentsData] = useState<CommentData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [, setPendingComment] = useState<string | null>(null);
  
  // Use our custom hook for API calls
  const [executeFetchComments, isLoading] = useApiCall(fetchComments);
  const [executePostComment, isPosting] = useApiCall(postComment);
  
  // Get current user ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);
  
  // Load initial data
  useEffect(() => {
    const loadCommentsData = async () => {
      if (!postId) {
        setError("No post ID provided");
        return;
      }
      
      const result = await executeFetchComments({ 
        feedId: postId, 
        page: 1, 
        limit: 10 
      });
      
      if (result.success && result.data) {
        // Map the API response to our expected format
        if (result.data.comments) {
          setCommentsData(result.data.comments);
        } else {
          setCommentsData([]);
        }
        
        setHasMore(result.data.hasMoreComments || false);
      } else {
        setError(result.data?.message || 'Failed to load comments');
      }
    };
    
    loadCommentsData();
  }, [postId]);

  // Function to load more comments
  const loadMoreComments = async () => {
    if (isLoading || !hasMore || !postId) return;
    
    const nextPage = page + 1;
    const result = await executeFetchComments({ 
      feedId: postId, 
      page: nextPage, 
      limit: 10 
    });
    
    if (result.success && result.data) {
      const data = result.data;
      if (data.comments) {
        setCommentsData(prev => [...prev, ...data.comments]);
      }
      setHasMore(data.hasMoreComments || false);
      setPage(nextPage);
    }
  };

  // Use infinite scroll hook
  const lastCommentRef = useInfiniteScroll({
    isLoading,
    hasMore,
    onLoadMore: loadMoreComments
  });
  
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !postId || isPosting) return;
    
    // Store the comment text in case we need to restore it
    const commentText = newComment.trim();
    setPendingComment(commentText);
    
    // Create a temporary comment with a unique ID
    const tempCommentId = `temp-${Date.now()}`;
    const tempComment: CommentData = {
      commentId: tempCommentId,
      postId: postId,
      parentComment: null,
      comment: commentText,
      createdAt: new Date().toISOString(),
      agoTime: "Just now",
      user: {
        userId: localStorage.getItem('userId') || '',
        name: post.name,
        profilePic: post.profilePic,
      },
      likes: 0,
      hasReplies: false
    };
    
    // Optimistically add the comment to the UI
    setCommentsData(prevComments => [tempComment, ...prevComments]);
    setpost(prevPost => ({
      ...prevPost,
      commentCount: prevPost.commentCount + 1
    }));
    
    // Clear the input field
    setNewComment("");
    
    // Send the API request
    const result = await executePostComment({
      postId,
      comment: commentText
    });
    
    if (!result.success) {
      // API call failed, revert the optimistic update
      setCommentsData(prevComments => 
        prevComments.filter(comment => comment.commentId !== tempCommentId)
      );
      setpost(prevPost => ({
        ...prevPost,
        commentCount: prevPost.commentCount - 1
      }));
      
      // Restore the comment text to the input field
      setNewComment(commentText);
      setPendingComment(null);
      
      // Show error toast
      toast.error("Failed to post comment. Please try again.");
    } else {
      // API call succeeded, update the temporary comment with the real data if available
      if (result.data && result.data.comment) {
        // If the API returns the actual comment data, update the temporary comment
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const realCommentData = result.data.comment as any; // Type assertion to avoid property access errors
        setCommentsData(prevComments => 
          prevComments.map(comment => 
            comment.commentId === tempCommentId 
              ? {
                  ...comment,
                  commentId: realCommentData.commentId || comment.commentId,
                  // Update any other fields that come from the API
                }
              : comment
          )
        );
      } else {
        // If the API doesn't return the actual comment data, just remove the temporary flag
        // Generate a permanent ID based on the timestamp
        const permanentId = `comment-${Date.now()}`;
        setCommentsData(prevComments => 
          prevComments.map(comment => 
            comment.commentId === tempCommentId 
              ? {
                  ...comment,
                  commentId: permanentId,
                }
              : comment
          )
        );
      }
      setPendingComment(null);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };
  
  return (
    <div className="relative max-w-2xl mx-auto bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky -top-10 z-10 bg-background p-4 pt-2 flex items-center border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Comments</h1>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Post Summary and Comment Input */}
        <div className="flex-none">
          {post && (
            <Post 
              user={post.name}
              userId={post.userId}
              avatar={post.profilePic}
              caption={post.data.content}
              image={post.data.media[0]?.url}
              likes={post.reactionCount}
              comments={post.commentCount}
              datePosted={post.ago_time}
              feedId={post.feedId}
              isOwner={currentUserId === post.userId}
              onCommentClick={() => {}}
              onLikeClick={() => {}}
            />
          )}

          {/* Comment Input */}
          <div className="p-4 border-b flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarImage} alt="Your avatar" />
              <AvatarFallback>YA</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Input
                placeholder="Add Your Comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-12 rounded-full bg-muted"
                disabled={isPosting}
              />
              <Button 
                size="icon" 
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-primary"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isPosting}
              >
                {isPosting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && commentsData.length === 0 ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">
              {error}. <Button variant="link" onClick={() => window.location.reload()}>Try again</Button>
            </div>
          ) : commentsData.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            commentsData.map((comment, index) => (
              <div
                key={`${comment.commentId}-${index}`}
                ref={index === commentsData.length - 1 ? lastCommentRef : undefined}
              >
                <Comment 
                  comment={{
                    ...comment,
                    likes: 0,
                    hasReplies: false
                  }}
                  postId={postId}
                  currentUserId={localStorage.getItem('userId') || undefined}
                  postAuthorId={post.name}
                  onCommentDeleted={(commentId) => {
                    setCommentsData(prev => prev.filter(c => c.commentId !== commentId));
                    setpost(prevPost => ({
                      ...prevPost,
                      commentCount: prevPost.commentCount - 1
                    }));
                  }}
                  isPending={comment.commentId.startsWith('temp-')}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}