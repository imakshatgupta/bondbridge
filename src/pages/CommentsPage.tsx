import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Comment } from "@/components/Comment";
import { Post } from "@/components/Post";
import { Input } from "@/components/ui/input";
import avatarImage from "/profile/user.png";
import { fetchComments, postComment } from "@/apis/commonApiCalls/commentsApi";

const dummyCommentsData = [
  {
    id: '1',
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: false
  },
  {
    id: '2',
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: true,
    replies: []
  },
  {
    id: '3',
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: false
  },
  {
    id: '4',
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: true,
    replies: []
  },
  {
    id: '5',
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: false
  }
];

export default function CommentsPage() {
  const navigate = useNavigate();
  const { postId } = useParams(); // Get postId from URL params
  const [newComment, setNewComment] = useState("");
  const [commentsData, setCommentsData] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCommentRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreComments();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore]);
  
  const [postData, setPostData] = useState({
    user: "Post Author",
    avatar: avatarImage,
    caption: "Original post caption appears here...",
    image: "",
    likes: 2100,
    comments: 24,
    datePosted: "2 days ago",
    postDate: ""
  });
  
  useEffect(() => {
    const fetchCommentsData = async () => {
      if (!postId) {
        setError("No post ID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const data = await fetchComments({ feedId: postId, page: 1, limit: 10 });
        console.log("Comments data:", data);
        setCommentsData(data.comments.length > 0 ? data.comments : dummyCommentsData);
        setHasMore(data.hasMoreComments || false);
        
        // If API returns post details, update postData
        if (data.post) {
          setPostData(data.post);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to fetch comments");
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommentsData();
  }, [postId]);

  const loadMoreComments = async () => {
    if (isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const data = await fetchComments({ 
        feedId: postId || '', 
        page: nextPage, 
        limit: 10 
      });
      
      if (data.comments && data.comments.length > 0) {
        setCommentsData(prev => [...prev, ...data.comments]);
        setPage(nextPage);
        setHasMore(data.hasMoreComments || false);
      } else {
        setHasMore(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error loading more comments:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsLoading(true);
      const data = await postComment({
        postId: postId || '',
        comment: newComment.trim()
      });
      
      // If comment was added successfully, update the local state
      if (data.success && data.newComment) {
        // Add the new comment to the state
        setCommentsData(prevComments => [data.newComment!, ...prevComments]);
        
        // Update post comment count if needed
        setPostData(prevPost => ({
          ...prevPost,
          comments: prevPost.comments + 1
        }));
      }
      
      setNewComment(""); // Clear input after submission
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to post comment");
      console.error("Error posting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCommentDummy = () => {
    if (!newComment.trim()) return;
    setCommentsData(prevComments => [{
        id: 1,
        user: "Muneeb",
        avatar: avatarImage,
        content: newComment.trim(),
        likes: 2100,
        timeAgo: "2 days ago",
        hasReplies: false
    }, ...prevComments]);
    setNewComment("");
  }
  
  return (
    <div className="relative max-w-2xl mx-auto bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky -top-10 z-10 bg-background p-4 pt-2  flex items-center border-b">
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
          <Post 
            user={postData.user}
            avatar={postData.avatar}
            caption={postData.caption}
            image={postData.image}
            likes={postData.likes}
            comments={postData.comments}
            datePosted={postData.datePosted}
            postDate={postData.postDate}
          />

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
                className="pr-12 rounded-full bg-muted"
              />
              <Button 
                size="icon" 
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-primary"
                onClick={handleSubmitCommentDummy}
                disabled={!newComment.trim()}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
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
            commentsData.map((comment, index) => {
              if (commentsData.length === index + 1) {
                return (
                  <div ref={lastCommentRef} key={comment.id}>
                    <Comment 
                      comment={comment}
                    />
                  </div>
                );
              } else {
                return (
                  <Comment 
                    key={comment.id}
                    comment={comment}
                  />
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
}