import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Comments } from "@/components/Comments";
import avatarImage from "@/assets/avatar.png";

const commentsData = [
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
  
  return (
    <div className="relative max-w-2xl mx-auto bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 flex items-center border-b">
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

      <Comments 
        postAuthor="Post Author"
        postAvatar={avatarImage}
        postCaption="Original post caption appears here..."
        postLikes={2100}
        postComments={24}
        postDate="2 days ago"
        comments={commentsData}
      />
    </div>
  );
} 