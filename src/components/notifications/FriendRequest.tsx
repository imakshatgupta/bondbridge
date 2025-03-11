import { Button } from "../ui/button";
import { useState } from "react";

type Props = {
  avatar: string;
  name: string;
  bio: string;
  requestId: number;
  userId?: string;  // For passing the current user's ID
}

const FriendRequest = ({ avatar, name, bio, requestId, userId }: Props) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);

  const [localAccept, setLocalAccept] = useState(false);
  const [localDecline, setLocalDecline] = useState(false);
  // to do: remove local accept

  const handleAcceptRequest = async () => {
    setIsAccepting(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('otherid', requestId.toString());
      
      // Get the token from localStorage or context if available
      const token = localStorage.getItem('token') || '';
      const currentUserId = userId || localStorage.getItem('userId') || '';
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/acceptRequest`, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          'userid': currentUserId,
          'token': token,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }
      
      // Handle success here - maybe update UI or notify parent component
      console.log('Friend request accepted successfully');
      
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineRequest = async () => {
    setIsDeclined(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('otherid', requestId.toString());
      
      // Get the token from localStorage or context if available
      const token = localStorage.getItem('token') || '';
      const currentUserId = userId || localStorage.getItem('userId') || '';
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/rejectRequest`, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          'userid': currentUserId,
          'token': token,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to decline friend request');
      }
      
      console.log('Friend request declined successfully');
      
    } catch (error) {
      console.error('Error declining friend request:', error);
      setIsDeclined(false); // Reset if there's an error
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
        <Button 
          className=""
          onClick={() => setLocalAccept(!localAccept)}
          disabled={isAccepting || isDeclined}
        >
          {/* {isAccepting ? 'Accepting...' : 'Accept'} */}
          {localAccept ? 'Accepted' : 'Accept'}
        </Button>
        <Button 
          variant={'outline'} 
          className="border-primary text-primary"
          onClick={() => setLocalDecline(!localDecline)}
          disabled={isAccepting || isDeclined}
        >
          {/* {isDeclined ? 'Declined' : 'Decline'} */}
          {localDecline ? 'Declined' : 'Decline'}
        </Button>
      </div>
    </div>
  )
}

export default FriendRequest