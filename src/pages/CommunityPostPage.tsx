import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { Comment } from "@/components/Comment";
import { Post } from "@/components/Post";
import { Input } from "@/components/ui/input";
import { fetchComments } from "@/apis/commonApiCalls/commentsApi";
import { fetchPostDetails } from "@/apis/commonApiCalls/communitiesApi";
import { useApiCall } from "@/apis/globalCatchError";
// import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  CommentData,
  HomePostData,
} from "@/apis/apiTypes/response";
// import { toast } from "sonner";
import { useAppSelector } from "@/store";
import LogoLoader from "@/components/LogoLoader";
import { CommunityPostResponse } from "@/apis/apiTypes/communitiesTypes";

export default function CommunityPostPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const location = useLocation();
  // Access post directly from state
  const locationState = location.state || {};
  const locationPost = locationState.post;

  // Community post data state
  const [post, setPost] = useState<HomePostData>(() => {
    if (!locationPost) {
      // If no post was provided in state, create a minimal object
      // (Will be populated from API once post details are fetched)
      return {
        _id: postId?.split(":")[0] || "",
        name: "",
        profilePic: "",
        userId: "",
        data: {
          content: "",
          media: [],
        },
        commentCount: 0,
        reactionCount: 0,
        reaction: {
          hasReacted: false,
          reactionType: null,
        },
        reactionDetails: {
          total: 0,
          types: {
            like: 0,
            love: 0,
            haha: 0,
            lulu: 0
          }
        },
        ago_time: "",
        feedId: postId || "",
        author: "",
        whoCanComment: 0,
        privacy: 0,
        content_type: null,
        taggedUsers: null,
        hideFrom: null,
        status: 0,
        createdAt: 0,
        weekIndex: "",
        isCommunity: true,
      };
    } else {
      // Convert TransformedPost to compatible format
      return {
        _id: locationPost.id || "",
        name: locationPost.author?.name || "",
        profilePic: locationPost.author?.profilePic || "",
        userId: locationPost.communityId || "",
        data: {
          content: locationPost.content || "",
          media: locationPost.media || [],
        },
        commentCount: locationPost.stats?.commentCount || 0,
        reactionCount: locationPost.stats?.reactionCount || 0,
        reaction: {
          hasReacted: locationPost.stats?.hasReacted || false,
          reactionType: locationPost.stats?.reactionType || null,
        },
        reactionDetails: locationPost.reactionDetails || {
          total: 0,
          types: {
            like: 0,
            love: 0,
            haha: 0,
            lulu: 0
          }
        },
        ago_time: new Date(locationPost.createdAt).toLocaleDateString(),
        feedId: postId || "",
        author: "",
        whoCanComment: 0,
        privacy: 0,
        content_type: null,
        taggedUsers: null,
        hideFrom: null,
        status: 0,
        createdAt: locationPost.createdAt || 0,
        weekIndex: "",
        isCommunity: true,
        communityId: locationPost.communityId
      };
    }
  });

  const [newComment, setNewComment] = useState("");
  const [commentsData, setCommentsData] = useState<CommentData[]>([]);
  const [error, setError] = useState<string | null>(null);
//   const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Get current user from Redux store
  const currentUser = useAppSelector((state) => state.currentUser);

  // Use our custom hook for API calls
  const [executeFetchComments, isLoadingComments] = useApiCall(fetchComments);
//   const [executePostComment, isPosting] = useApiCall(postComment);
  const [executeGetPostDetails, isLoadingPost] = useApiCall(fetchPostDetails);
  
  // Define isPosting variable until we implement comment functionality
  const isPosting = false;

  // Combined loading state for the entire page
  const pageLoading =
    isLoadingPost || (isLoadingComments && !initialDataLoaded);

  // Get current user ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
  }, []);

  // Fetch post details if not provided in state
  useEffect(() => {
    const fetchCommunityPostDetails = async () => {
      if (!postId || locationPost) return; // Skip if postId is missing or post is already available

      const result = await executeGetPostDetails(postId.split(":")[0]);

      if (result.success && result.data) {
        const apiPostData = result.data as unknown as CommunityPostResponse;
        
        // Map the API response to our expected HomePostData format
        const mappedPost: HomePostData = {
          _id: apiPostData._id,
          name: apiPostData.name,
          profilePic: apiPostData.profilePic,
          userId: apiPostData.author, // Community ID
          data: apiPostData.data,
          commentCount: apiPostData.commentCount || 0,
          reactionCount: apiPostData.reactionCount || 0,
          reaction: apiPostData.reaction || {
            hasReacted: false,
            reactionType: null,
          },
          reactionDetails: {
            total: apiPostData.reactionCount || 0,
            types: {
              like: 0,
              love: 0,
              haha: 0,
              lulu: 0
            }
          },
          ago_time: apiPostData.ago_time || "Recently",
          feedId: apiPostData.feedId || postId,
          author: apiPostData.author,
          whoCanComment: apiPostData.whoCanComment,
          privacy: apiPostData.privacy,
          content_type: apiPostData.content_type,
          taggedUsers: apiPostData.taggedUsers,
          hideFrom: apiPostData.hideFrom || [],
          status: apiPostData.status,
          createdAt: apiPostData.createdAt,
          weekIndex: apiPostData.weekIndex || "",
          isCommunity: true,
          communityId: apiPostData.author // Store community ID
        };
        
        setPost(mappedPost);
      } else {
        setError("Failed to load post details. Please try again.");
      }
    };

    fetchCommunityPostDetails();
  }, [postId, locationPost]);

  // Helper function to sort comments by creation time (newest first)
  const sortCommentsByTime = (comments: CommentData[]): CommentData[] => {
    return [...comments].sort((a, b) => {
      // Try to parse the dates from createdAt
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      // Sort in descending order (newest first)
      return dateB - dateA;
    });
  };

  // Load initial comments
  useEffect(() => {
    const loadCommentsData = async () => {
      if (!postId) {
        setError("No post ID provided");
        return;
      }

      const result = await executeFetchComments({
        feedId: postId,
        page: 1,
        limit: 10,
      });

      if (result.success && result.data) {
        // Map the API response to our expected format
        if (result.data.comments) {
          // Sort comments by time (newest first)
          const sortedComments = sortCommentsByTime(result.data.comments);
          setCommentsData(sortedComments);
        } else {
          setCommentsData([]);
        }

        setHasMore(result.data.hasMoreComments || false);
      } else {
        setError(result.data?.message || "Failed to load comments");
      }

      // Mark initial data as loaded
      setInitialDataLoaded(true);
    };

    loadCommentsData();
  }, [postId]);

  // Function to load more comments
//   const loadMoreComments = async () => {
//     if (isLoadingPost || !hasMore || !postId) return;

//     const nextPage = page + 1;
//     const result = await executeFetchComments({
//       feedId: postId,
//       page: nextPage,
//       limit: 10,
//     });

//     if (result.success && result.data) {
//       const data = result.data;
//       if (data.comments) {
//         const newComments = data.comments;
//         setCommentsData(prevComments => [
//           ...prevComments,
//           ...sortCommentsByTime(newComments)
//         ]);
//         setPage(nextPage);
//         setHasMore(data.hasMoreComments || false);
//       }
//     }
//   };

  // Set up infinite scroll for comments
//   const loadMoreTriggerRef = useInfiniteScroll(loadMoreComments);

//   // Handle comment submission
//   const handleSubmitComment = async () => {
//     if (!newComment.trim() || !postId || isPosting) return;

//     // Optimistically update the UI with the new comment
//     const optimisticComment: CommentData = {
//       _id: `temp-${Date.now()}`,
//       user: {
//         _id: currentUserId || "",
//         name: currentUser.username || "You",
//         profilePic: currentUser.avatar || "",
//       },
//       content: newComment,
//       createdAt: new Date().toISOString(),
//       comments: [],
//       parent: null,
//       updated: false,
//       isLiked: false,
//       likeCount: 0,
//     };

//     // Add the new comment to the beginning of the list (newest first)
//     setCommentsData(prevComments => [optimisticComment, ...prevComments]);
//     setNewComment(""); // Clear the input field

//     // Make the API call to post the comment
//     const result = await executePostComment({
//       feedId: postId,
//       comment: newComment,
//     });

//     if (!result.success) {
//       // If the API call fails, remove the optimistic comment
//       setCommentsData(prevComments =>
//         prevComments.filter(comment => comment._id !== optimisticComment._id)
//       );
//       toast.error("Failed to post comment. Please try again.");
//       // Restore the comment text
//       setNewComment(newComment);
//     } else {
//       // Update the comment count on the post
//       setPost(prevPost => ({
//         ...prevPost,
//         commentCount: (prevPost.commentCount || 0) + 1,
//       }));

//       // Refresh the comments to get the actual comment data (including ID)
//       const refreshResult = await executeFetchComments({
//         feedId: postId,
//         page: 1,
//         limit: 10,
//       });

//       if (refreshResult.success && refreshResult.data?.comments) {
//         setCommentsData(sortCommentsByTime(refreshResult.data.comments));
//       }
//     }
//   };

//   // Handle key press in the comment input
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmitComment();
//     }
//   };

//   // Handle post deletion
//   const handlePostDelete = () => {
//     toast.success("Post deleted successfully");
//     navigate(-1);
//   };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 flex items-center border-b">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Community Post</h1>
      </div>

      {pageLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LogoLoader size="lg" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Post Summary and Comment Input */}
          <div className="flex-none">
            {post && (
              <Post
                user={post.name}
                userId={post.userId}
                avatar={post.profilePic}
                caption={post.data.content}
                media={post.data.media || []}
                initialReactionCount={post.reactionCount}
                comments={post.commentCount}
                datePosted={post.ago_time}
                feedId={post.feedId}
                isOwner={currentUserId === post.userId}
                onCommentClick={() => {}}
                onLikeClick={() => {}}
                initialReaction={post.reaction}
                initialReactionDetails={post.reactionDetails}
                // onDelete={handlePostDelete}
              />
            )}

            {/* Comment Input */}
            <div className="p-4 border-t border-b flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage
                  src={currentUser.profilePic || currentUser.avatar}
                  alt="Your avatar"
                />
                <AvatarFallback>
                  {currentUser.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                // onKeyDown={handleKeyDown}
                disabled={isPosting}
                className="flex-1 bg-muted"
              />
              <Button
                variant="ghost"
                size="sm"
                // onClick={handleSubmitComment}
                disabled={!newComment.trim() || isPosting}
                className="ml-2"
              >
                Post
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="overflow-y-auto flex-1 p-4">
            {commentsData.length === 0 && !isLoadingComments ? (
              <div className="text-center text-muted-foreground my-8">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <>
                {/* {commentsData.map((comment) => (
                //   <Comment
                //     key={comment._id}
                //     id={comment._id}
                //     username={comment.user.name}
                //     avatar={comment.user.profilePic || avatarImage}
                //     content={comment.content}
                //     timestamp={new Date(comment.createdAt).toLocaleString()}
                //     likeCount={comment.likeCount}
                //     isLiked={comment.isLiked}
                //     onReply={() => {
                //       // Set focus to the comment input
                //       const input = document.querySelector('input[placeholder="Add a comment..."]') as HTMLInputElement;
                //       if (input) {
                //         input.focus();
                //         setNewComment(`@${comment.user.name} `);
                //       
                //     }}
                //     onLike={() => {
                //       // Like functionality would go here
                //     }}
                //     isCurrentUser={comment.user._id === currentUserId}
                //   />
                ))} */}

                {/* Load more trigger */}
                {hasMore && (
                  <div
                    // ref={loadMoreTriggerRef}
                    className="h-10 flex justify-center items-center my-4"
                  >
                    {isLoadingComments && (
                      <div className="text-sm text-muted-foreground">
                        Loading more comments...
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 