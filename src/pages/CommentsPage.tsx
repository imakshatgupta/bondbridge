import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Comment } from "@/components/Comment";
import { Post } from "@/components/Post";
import { Input } from "@/components/ui/input";
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
  const [newComment, setNewComment] = useState("");
  
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
            user="Post Author"
            avatar={avatarImage}
            caption="Original post caption appears here..."
            image=""
            likes={2100}
            comments={24}
            datePosted="2 days ago"
            postDate=""
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
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {commentsData.map((comment) => (
            <Comment 
              key={comment.id}
              comment={comment}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 