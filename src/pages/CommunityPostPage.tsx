import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Comment } from "@/components/Comment";
import { Post } from "@/components/Post";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchPostDetails, commentOnPost } from "@/apis/commonApiCalls/communitiesApi";
import { useApiCall } from "@/apis/globalCatchError";
import { toast } from "sonner";
import { useAppSelector } from "@/store";
import LogoLoader from "@/components/LogoLoader";
import {
  ExtendedCommentData,
  CommentDetailsData,
  TransformedCommunityPost,
  ReactionDetails,
  Reaction,
  CommunityPostResponse
} from "@/apis/apiTypes/communitiesTypes";
import { getRelativeTime } from "@/lib/utils";

const transformApiPostToUiPost = (apiPost: CommunityPostResponse, communityId?: string): TransformedCommunityPost | null => {
  if (!apiPost || !apiPost._id) return null;

  // Determine community ID - prioritizing passed argument, then falling back to author (as potentially done before)
  const finalCommunityId = communityId || apiPost.author;

  if (!finalCommunityId) {
      console.error("Could not determine community ID for post:", apiPost._id);
      // Return null or a minimally viable object based on requirements
      return null;
  }

  // Ensure reactionDetails and types exist, providing defaults
  const reactionDetails: ReactionDetails = {
    total: apiPost.reactionCount || 0,
    reactions: [], 
    types: {
      like: apiPost.reactionDetails?.types?.like || 0,
      love: apiPost.reactionDetails?.types?.love || 0,
      haha: apiPost.reactionDetails?.types?.haha || 0,
      lulu: apiPost.reactionDetails?.types?.lulu || 0,
    },
  };

  const reaction: Reaction = {
    hasReacted: apiPost.reaction?.hasReacted || false,
    reactionType: apiPost.reaction?.reactionType || null,
  };


  return {
    id: apiPost._id,
    author: {
      id: apiPost.userId || "", // Prefer specific author ID
      name: apiPost.name || "Community", // Default name if needed
      profilePic: apiPost.profilePic || "", // Default pic if needed
    },
    content: apiPost.data?.content || "",
    createdAt: apiPost.createdAt || Date.now(), // Default to now if missing
    media: apiPost.data?.media || [],
    stats: {
      commentCount: apiPost.commentCount || 0,
      reactionCount: apiPost.reactionCount || 0,
      hasReacted: reaction.hasReacted,
      reactionType: reaction.reactionType,
    },
    reactionDetails: reactionDetails,
    communityId: finalCommunityId, // Use the determined community ID
    isAnonymous: apiPost.isAnonymous || false, // Default value
    isAdmin: apiPost.isAdmin || false, // Default value
    // ago_time: apiPost.agoTime || getRelativeTime(new Date(apiPost.createdAt || Date.now()).toISOString()),
  };
};

// Helper to transform location state post if present
const transformLocationPostToUiPost = (locationPost: TransformedCommunityPost | undefined | null): TransformedCommunityPost | null => {
    if (!locationPost || !locationPost.id) return null;

    // Ensure reactionDetails and types exist, providing defaults
    const reactionDetails: ReactionDetails = {
      total: locationPost.stats?.reactionCount || 0,
      reactions: locationPost.reactionDetails?.reactions || [],
      types: {
        like: locationPost.reactionDetails?.types?.like || 0,
        love: locationPost.reactionDetails?.types?.love || 0,
        haha: locationPost.reactionDetails?.types?.haha || 0,
        lulu: locationPost.reactionDetails?.types?.lulu || 0,
      }
    };


    const reaction: Reaction = {
        hasReacted: locationPost.stats?.hasReacted || false,
        reactionType: locationPost.stats?.reactionType || null
    }

    return {
        id: locationPost.id,
        author: {
            id: locationPost.author?.id || "",
            name: locationPost.author?.name || "",
            profilePic: locationPost.author?.profilePic || "",
        },
        content: locationPost.content || "",
        createdAt: locationPost.createdAt || Date.now(),
        media: locationPost.media || [],
        stats: {
            commentCount: locationPost.stats?.commentCount || 0,
            reactionCount: locationPost.stats?.reactionCount || 0,
            hasReacted: reaction.hasReacted,
            reactionType: reaction.reactionType,
        },
        reactionDetails: reactionDetails,
        communityId: locationPost.communityId || "",
        isAnonymous: locationPost.isAnonymous || false,
        isAdmin: locationPost.isAdmin || false,
        ago_time: locationPost.ago_time || getRelativeTime(new Date(locationPost.createdAt || Date.now()).toISOString()),
    };
};

export default function CommunityPostPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>(); // Ensure postId type
  const location = useLocation();
  const locationState = location.state || {};
  // Attempt to transform location post immediately
  const initialPost = transformLocationPostToUiPost(locationState.post);

  const [post, setPost] = useState<TransformedCommunityPost | null>(initialPost);
  const [commentsData, setCommentsData] = useState<ExtendedCommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(!!initialPost); // True if initialPost exists
  const [postCommentAs, setPostCommentAs] = useState<"user" | "anonymous">("user"); // State for anonymous comment toggle

  const currentUser = useAppSelector((state) => state.currentUser);
  const [executeGetPostDetails, isLoadingPost] = useApiCall(fetchPostDetails);
  const [executePostComment, isPosting] = useApiCall(commentOnPost);

  // Combined loading state for the initial fetch
  const pageLoading = isLoadingPost && !initialDataLoaded;

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
    
  }, []);

  // Helper function to sort comments by creation time (newest first)
  const sortCommentsByTime = (comments: ExtendedCommentData[]): ExtendedCommentData[] => {
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order
    });
  };

  // Format comments from post details (ensure API type safety)
  const extractCommentsFromPostDetails = (apiPostDetails: CommunityPostResponse): ExtendedCommentData[] => {
    if (!apiPostDetails || !apiPostDetails.comments || !Array.isArray(apiPostDetails.comments)) {
      return [];
    }

    return apiPostDetails.comments.map((comment: CommentDetailsData): ExtendedCommentData => {
      // Provide default user details if missing
      const userDetails = comment.userDetails || {};
      const isAnonymous = comment.author == "anonymous";
      const authorId = comment.author || 'unknown_author'; // Fallback author ID

      return {
        _id: comment._id,
        commentId: comment._id,
        postId: apiPostDetails._id || apiPostDetails.feedId || "",
        parentComment: null, // Assuming top-level comments for now
        comment: comment.content || "", // Use comment content
        content: comment.content || "",
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt, 
        agoTime: getRelativeTime(comment.createdAt),
        user: {
          userId: authorId,
          _id: authorId, // Use consistent ID
          name: isAnonymous ? "Anonymous" : (userDetails.name || "Unknown User"),
          profilePic: isAnonymous ? "/profile/anonymous.png" : (userDetails.profilePic || userDetails.avatar || "")
        },
        likes: comment.likes || 0,
        likeCount: comment.likes || 0,
        hasReplies: Boolean(comment.replies && comment.replies.length > 0),
        isLiked: false, // Default, needs clarification from API if available
        reaction: {
          hasReacted: false, // Default
          reactionType: null
        }
      };
    });
  };

  // Primary data fetching function
  const fetchFullPostDetails = async (forceRefresh = false) => {
    console.log("fetchFullPostDetails")
    if (!postId) {
      setError("No post ID provided");
      setInitialDataLoaded(true); // Stop loading indicator
      return;
    }
    console.log("forceRefresh:",forceRefresh, "post:",post, "initialDataLoaded:",initialDataLoaded)

    // Only fetch if post is not already loaded or forceRefresh is true
    if (!forceRefresh && post && initialDataLoaded) {
        return;
    }

    try {
      // Extract base ID if it contains ":"
      const cleanPostId = postId.includes(':') ? postId.split(":")[0] : postId;
      const result = await executeGetPostDetails(cleanPostId);

      if (result.success && result.data) {
        const apiPostData = result.data as CommunityPostResponse;
        const transformedPost = transformApiPostToUiPost(apiPostData);


        if (transformedPost) {
            setPost(transformedPost);

             // Extract comments using the raw API data
            const comments = extractCommentsFromPostDetails(apiPostData);
            const sortedComments = sortCommentsByTime(comments);
            setCommentsData(sortedComments);
            setError(null);
        } else {
             setError("Failed to process post details.");
             setCommentsData([]);
        }

      } else {
        setError("Failed to load post details. Please try again.");
        setPost(null); // Clear post data on failure
        setCommentsData([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching post details:", err);
      // Type check before accessing properties
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`An error occurred: ${errorMessage}`);
      setPost(null);
      setCommentsData([]);
    } finally {
        // Ensure initial loaded state is set even on error, to hide main loader
        setInitialDataLoaded(true);
    }
  };

  // Fetch data on initial mount and when postId changes
  useEffect(() => {
    fetchFullPostDetails(true);
  }, [postId]); // Dependency array includes postId

  // Handle comment submission
  const handleSubmitComment = async () => {
    // Ensure post, post.id, post.communityId are available
    if (!newComment.trim() || !post || !post.id || !post.communityId || isPosting) {
        if (!post?.communityId) {
            toast.error("Cannot identify community for this post.");
        }
        return;
    }

    const isAnonymousPost = postCommentAs === 'anonymous';

    // Optimistic update
    const optimisticComment: ExtendedCommentData = {
      _id: `temp-${Date.now()}`,
      commentId: `temp-${Date.now()}`,
      postId: post.id,
      parentComment: null,
      comment: newComment,
      content: newComment,
      createdAt: new Date().toISOString(),
      agoTime: "Just now",
      user: {
        userId: isAnonymousPost ? 'anonymous' : (currentUserId || "temp-user"),
        _id: isAnonymousPost ? 'anonymous' : (currentUserId || "temp-user"),
        name: isAnonymousPost ? "Anonymous" : (currentUser.username || "You"),
        profilePic: isAnonymousPost ? "/profile/anonymous.png" : (currentUser.profilePic || currentUser.avatar || ""),
      },
      likes: 0,
      likeCount: 0,
      hasReplies: false,
      isLiked: false,
      reaction: { hasReacted: false, reactionType: null },
    };

    setCommentsData(prevComments => [optimisticComment, ...prevComments]);
    // Optimistically update comment count on the post state
    setPost(prevPost => prevPost ? ({
        ...prevPost,
        stats: {
            ...prevPost.stats,
            commentCount: (prevPost.stats.commentCount || 0) + 1,
        }
    }) : null);
    const originalComment = newComment; // Store original comment for potential revert
    setNewComment("");

    try {
      const result = await executePostComment(
        post.communityId,
        {
          postId: post.id,
          content: originalComment,
          isAnonymous: isAnonymousPost
        }
      );

      if (!result.success) {
        toast.error("Failed to post comment. Please try again.");
        // Revert optimistic updates
        setCommentsData(prevComments =>
          prevComments.filter(comment => comment._id !== optimisticComment._id)
        );
         setPost(prevPost => prevPost ? ({
            ...prevPost,
            stats: {
                ...prevPost.stats,
                commentCount: Math.max(0, (prevPost.stats.commentCount || 0) - 1), // Decrement count
            }
        }) : null);
        setNewComment(originalComment); // Restore input
      } else {
        // Comment posted successfully, refresh data to get real comment ID and details
        await fetchFullPostDetails(true); // Force refresh
      }
    } catch (error: unknown) {
      console.error("Error posting comment:", error);
       // Type check before accessing properties
      const postErrorMessage = error instanceof Error ? error.message : 'Unknown error posting comment';
      toast.error(`An error occurred: ${postErrorMessage}`);
      // Revert optimistic updates
      setCommentsData(prevComments =>
        prevComments.filter(comment => comment._id !== optimisticComment._id)
      );
       setPost(prevPost => prevPost ? ({
            ...prevPost,
            stats: {
                ...prevPost.stats,
                commentCount: Math.max(0, (prevPost.stats.commentCount || 0) - 1),
            }
        }) : null);
      setNewComment(originalComment); // Restore input
    }
  };

  // Handle key press in the comment input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // Handle post deletion (assuming deletePost API exists and is imported)
  const handlePostDelete = async (deletedPostId: string) => {
      // Optional: Add confirmation dialog here
      console.log("Attempting to delete post:", deletedPostId); // Placeholder
      // Example: const success = await executeDeletePost(post.communityId, deletedPostId);
      // if (success) {
          toast.success("Post deleted successfully");
          navigate(-1); // Navigate back after deletion
      // } else {
      //    toast.error("Failed to delete post.");
      // }
  };

  // Callback for when a comment is deleted via the Comment component
   const handleCommentDeleted = (commentId: string) => {
        setCommentsData(prevComments =>
            prevComments.filter(c => c._id !== commentId)
        );
        // Update comment count on the post state
        setPost(prevPost => prevPost ? ({
            ...prevPost,
            stats: {
                ...prevPost.stats,
                commentCount: Math.max(0, (prevPost.stats.commentCount || 0) - 1),
            }
        }) : null);
   };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="pb-4 flex items-center border-b">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Community Post</h1>
      </div>

      {pageLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LogoLoader size="lg" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div>
            <p className="text-destructive mb-4">{error}</p> {/* Use destructive color for errors */}
            <Button variant="outline" onClick={() => fetchFullPostDetails(true)}> {/* Add retry */}
              Try Again
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)} className="ml-2"> {/* Go back option */}
              Go Back
            </Button>
          </div>
        </div>
      ) : !post ? ( // Handle case where post is null after loading attempt
         <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
            Post not found or failed to load.
         </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Post Summary and Comment Input */}
          <div className="flex-none">
             {/* Use props aligned with CommunityQuotes.tsx */}
              <Post
                user={post.author?.name || "Community User"} // Default name
                userId={post.author?.id || ""} // Author ID
                avatar={post.author?.profilePic || ""} // Author avatar
                caption={post.content || ""}
                media={post.media || []}
                comments={post.stats?.commentCount || 0} // Use stats
                datePosted={post.createdAt || 0}
                agoTimeString={post.ago_time || getRelativeTime(new Date(post.createdAt || 0).toISOString())} // Use calculated ago_time
                isOwner={currentUserId === post.author?.id} // Check against author ID
                feedId={post.id} // Use post.id as feedId
                onDelete={() => handlePostDelete(post.id)} // Pass post ID to delete handler
                isCommunity={true} // Hardcoded as true for this page context
                isAnonymous={post.isAnonymous || false} // Use state value or default
                isCommunityAdmin={post.isAdmin || false} // Use state value or default
                communityId={post.communityId || ""} // Use state value
                initialReaction={post.stats || { hasReacted: false, reactionType: null }} // Pass reaction object from stats
                initialReactionCount={post.stats?.reactionCount || 0} // Use stats
                initialReactionDetails={post.reactionDetails || { total: 0, reactions: [], types: {} }} // Pass reaction details
                onCommentClick={() => {}} // Keep as no-op for now
                // onLikeClick is handled internally by Post component now based on props
              />


            {/* Comment Input */}
            <div className="p-4 border-t border-b flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <div className="flex items-center gap-1.5 cursor-pointer group mr-3">
                      <Avatar className="h-8 w-8">
                         {postCommentAs === 'user' ? (
                            <AvatarImage src={currentUser.profilePic || currentUser.avatar} alt={currentUser.username || "Profile"} />
                         ) : (
                            <AvatarImage src="/profile/anonymous.png" alt="Anonymous" />
                         )}
                         <AvatarFallback>
                            {postCommentAs === 'user' ? (currentUser.username ? currentUser.username[0].toUpperCase() : "U") : "A"}
                         </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                   </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                   <DropdownMenuItem onSelect={() => setPostCommentAs('user')} className="cursor-pointer">
                      <Avatar className="h-6 w-6 mr-2">
                         <AvatarImage src={currentUser.profilePic || currentUser.avatar} alt={currentUser.username || "Profile"} />
                         <AvatarFallback>
                         {currentUser.username ? currentUser.username[0].toUpperCase() : "U"}
                         </AvatarFallback>
                      </Avatar>
                      Comment as {currentUser.username || "Yourself"}
                   </DropdownMenuItem>
                   <DropdownMenuItem onSelect={() => setPostCommentAs('anonymous')} className="cursor-pointer">
                      <Avatar className="h-6 w-6 mr-2">
                         <AvatarImage src="/profile/anonymous.png" alt="Anonymous" />
                         <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      Comment Anonymously
                   </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPosting}
                className="flex-1 bg-muted"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isPosting || !post} // Disable if post is null
                className="ml-2"
              >
                {isPosting ? "Posting..." : "Post"} {/* Indicate posting state */}
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="overflow-y-auto flex-1">
             {/* Check isLoadingPost specifically for comments loading indicator if needed */}
            {isLoadingPost && commentsData.length === 0 ? (
                <div className="text-center text-muted-foreground my-8">Loading comments...</div>
            ) : commentsData.length === 0 ? (
              <div className="text-center text-muted-foreground my-8">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <>
                {commentsData.map((comment) => (
                  <Comment
                    key={comment._id} // Use _id as key
                    comment={{
                      commentId: comment._id, // Map fields correctly
                      postId: post.id || "", // Use post ID from state
                      comment: comment.content || comment.comment || "",
                      createdAt: comment.createdAt,
                      agoTime: comment.agoTime || getRelativeTime(comment.createdAt),
                      user: {
                        userId: comment.user.userId,
                        name: comment.user.name,
                        profilePic: comment.user.profilePic
                      },
                      likes: comment.likes || 0,
                      hasReplies: comment.hasReplies || false,
                      parentComment: comment.parentComment || null,
                      reaction: comment.reaction || { // Ensure reaction object exists
                        hasReacted: comment.isLiked || false,
                        reactionType: comment.isLiked ? 'like' : null
                      }
                    }}
                    currentUserId={currentUserId || ""}
                    postId={post.id || ""} // Pass post ID
                    isCommunity
                    communityId={post.communityId || ""} // Pass community ID
                    onCommentDeleted={handleCommentDeleted} // Use the refactored handler
                  />
                ))}

                {/* Remove Load more trigger and logic */}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 