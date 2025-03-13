import { Button } from "../ui/button";
import { useState } from "react";
// import { acceptFriendRequest, rejectFriendRequest } from "@/apis/commonApiCalls/friendRequestApi";
import { FriendRequestProps } from "@/types/notification";

const FriendRequest = ({ avatar, name, bio, requestId, onAcceptSuccess, onRejectSuccess }: FriendRequestProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAcceptRequest = async () => {
    setIsAccepting(true);
    try {
      // await acceptFriendRequest({ otherId: requestId });
      
      // Handle success
      setIsAccepted(true);
      console.log('Friend request accepted successfully');
      
      // Notify parent component to remove this request
      if (onAcceptSuccess) {
        onAcceptSuccess(requestId);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineRequest = async () => {
    setIsDeclining(true);
    try {
      // await rejectFriendRequest({ otherId: requestId });
      
      setIsDeclined(true);
      console.log('Friend request declined successfully');
      
      // Notify parent component to remove this request
      if (onRejectSuccess) {
        onRejectSuccess(requestId);
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    } finally {
      setIsDeclining(false);
    }
  };
      
  return (
    <div className="flex items-center gap-4 p-4 border-b hover:bg-muted cursor-pointer">
      <div className="w-12 h-12">
        <img 
          src={avatar} 
          alt="User avatar" 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-xl text-foreground">{name}</h3>
        <p className="text-muted-foreground">{bio}</p>
      </div>
      <div className="flex gap-2">
        {!isDeclined && (
          <Button 
            className=""
            onClick={handleAcceptRequest}
            disabled={isAccepting || isAccepted}
          >
            {isAccepting ? 'Accepting...' : isAccepted ? 'Accepted' : 'Accept'}
          </Button>
        )}
        {!isAccepted && (
          <Button 
            variant={'outline'} 
            className="border-primary text-primary"
            onClick={handleDeclineRequest}
            disabled={isDeclining || isDeclined}
          >
            {isDeclining ? 'Declining...' : isDeclined ? 'Declined' : 'Decline'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default FriendRequest