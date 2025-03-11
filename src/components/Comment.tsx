import { useState, useCallback, memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, MoreHorizontal, Reply, ArrowRight, Share2, Trash, Flag } from "lucide-react";
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

// Memoized reply component to prevent unnecessary re-renders
const ReplyComment = memo(({ comment }: { comment: CommentData }) => (
  <Comment comment={comment} isReply={true} />
));
ReplyComment.displayName = 'ReplyComment';

export function Comment({ comment, isReply = false }: CommentProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem><Share2 className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
                <DropdownMenuItem><Flag className="w-4 h-4 mr-2" /> Report</DropdownMenuItem>
                {/* show only if user is the owner of the post */}
                <DropdownMenuItem><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <ReplyComment key={reply.id} comment={reply} />
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