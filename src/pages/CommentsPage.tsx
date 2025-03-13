import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Comment } from "@/components/Comment";
import { Post } from "@/components/Post";
import { Input } from "@/components/ui/input";
import avatarImage from "/profile/user.png";
const apiUrl = import.meta.env.VITE_API_URL;

const dummyCommentsData = [
  {
    id: 1,
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: false
  },
  {
    id: 2,
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: true,
    replies: []
  },
  {
    id: 3,
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: false
  },
  {
    id: 4,
    user: "Anonymous one",
    avatar: avatarImage,
    content: "Lorem ipsum dolor sit.",
    likes: 2100,
    timeAgo: "2 days ago",
    hasReplies: true,
    replies: []
  },
  {
    id: 5,
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
    const fetchComments = async () => {
      if (!postId) {
        setError("No post ID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get user credentials from local storage or context
        // const userId = localStorage.getItem('userId');
        // const token = localStorage.getItem('token');
        const userId = '67d00b147b762b88b1e49496';
        const token = '6a0RdRmErNgSQzDN7H69oLTIrMBKoIwy0fVcyKA9Jdp1Ysdw2FNk82fPFU3tP7YA';
        
        if (!userId || !token) {
          setError("Authentication required");
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`${apiUrl}/api/getCommentsForPostId`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "userId": userId,
            "token": token
          },
          body: JSON.stringify({ feedId: postId })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setCommentsData(data.comments.length>0 ? data.comments : dummyCommentsData);
        
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
    
    fetchComments();
  }, [postId]);
  
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Get user credentials from local storage or context
      // const userId = localStorage.getItem('userId');
      // const token = localStorage.getItem('token');
      const userId = '67d00b147b762b88b1e49496';
      const token = '6a0RdRmErNgSQzDN7H69oLTIrMBKoIwy0fVcyKA9Jdp1Ysdw2FNk82fPFU3tP7YA';
      
      if (!userId || !token) {
        setError("Authentication required");
        return;
      }
      
      const response = await fetch(`${apiUrl}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userId": userId,
          "token": token
        },
        body: JSON.stringify({
          postId: postId,
          comment: newComment.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // If comment was added successfully, update the local state
      if (data.success && data.newComment) {
        // Add the new comment to the state
        setCommentsData(prevComments => [data.newComment, ...prevComments]);
        
        // Update post comment count if needed
        setPostData(prevPost => ({
          ...prevPost,
          comments: prevPost.comments + 1
        }));
      }
      
      setNewComment(""); // Clear input after submission
      
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to fetch comments");
      console.error("Error fetching comments:", error);
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
            commentsData.map((comment) => (
              <Comment 
                key={comment.id}
                comment={comment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}