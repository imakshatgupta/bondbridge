import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FollowRequest } from "@/apis/commonApiCalls/notificationsApi";
import { useNavigate } from "react-router-dom";

interface SentRequestProps extends FollowRequest {
  onActionComplete?: (requestId: string, success: boolean) => void;
}

const SentRequest = ({
  _id,
  name,
  profilePic,
  interests,
  onActionComplete,
}: SentRequestProps) => {
  const [isPending, setIsPending] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const navigate = useNavigate();

  const viewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${_id}`);
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistically update UI
    setIsPending(true);
    
    try {
      // Future implementation for canceling request
      // Right now, just simulating success for UI demo
      // In the real implementation, we would call an API to cancel the request
      
      setTimeout(() => {
        setIsCanceled(true);
        setIsPending(false);
        
        if (onActionComplete) {
          onActionComplete(_id, true);
        }
      }, 500);
    } catch (error) {
      setIsPending(false);
      
      if (onActionComplete) {
        onActionComplete(_id, false);
      }
    }
  };

  // If the request has been canceled already, don't show it
  if (isCanceled) return null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors cursor-pointer" onClick={viewProfile}>
      <Avatar className="h-12 w-12">
        <AvatarImage src={profilePic} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{name}</h4>
        
        {interests && interests.length > 0 && (
          <p className="text-sm text-muted-foreground truncate">
            Interests: {interests.slice(0, 3).join(", ")}
            {interests.length > 3 && "..."}
          </p>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cancel request</span>
        </Button>
      </div>
    </div>
  );
};

export default SentRequest; 