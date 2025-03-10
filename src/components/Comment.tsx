import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, MoreVertical, Reply, ArrowRight } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface CommentData {
  id: number;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  timeAgo: string;
  replies?: CommentData[];
  hasReplies?: boolean;
}

interface CommentProps {
  comment: CommentData;
  isReply?: boolean;
}

export function Comment({ comment, isReply = false }: CommentProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  const formattedLikes = comment.likes >= 1000 
    ? `${(comment.likes / 1000).toFixed(1)}k` 
    : comment.likes.toString();
  
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
                {comment.hasReplies && (
                  <button 
                    className="text-xs text-muted-foreground"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    {showReplies ? "Hide Replies" : "2k Replies"}
                  </button>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Delete</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-muted-foreground"
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {formattedLikes}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-muted-foreground"
              onClick={() => setShowReplies(!showReplies)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {comment.replies?.length || 0}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-muted-foreground"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
          </div>

          {showReplyInput && (
            <div className="mt-2 relative">
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="rounded-full bg-muted pr-12"
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2 text-primary"
                disabled={!replyText.trim()}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => (
                <Comment key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 