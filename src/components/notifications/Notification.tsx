import { useState } from 'react';
import { getRelativeTime } from '../../lib/utils';
const apiUrl = import.meta.env.VITE_API_URL;

interface NotificationProps {
  id: number
  title: string
  description: string
  avatar: string
  timestamp: Date
  seen: boolean
  onMarkAsSeen: (id: number) => void
}

const Notification = ({ id, title, description, avatar, timestamp, seen, onMarkAsSeen }: NotificationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localseen, setLocalSeen] = useState(seen);
  // to do: remove local seen and use seen instead

  const handleClick = async () => {
    if (seen) return;
    
    // setIsLoading(true);
    // try {
    //   const response = await fetch(`${apiUrl}/mark-as-seen`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       notificationId: id
    //     }),
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to mark notification as seen');
    //   }

    //   onMarkAsSeen(id);
    // } catch (error) {
    //   console.error('Error marking notification as seen:', error);
    // } finally {
    //   setIsLoading(false);
    // }
    setLocalSeen(true);
  };

  return (
    <div className={`flex items-center gap-4 p-4 border-b hover:bg-muted cursor-pointer ${isLoading ? 'opacity-70' : ''}`}
        onClick={handleClick} >
      <div className="w-12 h-12">
        <img 
          src={avatar} 
          alt="User avatar" 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-xl text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="text-sm text-muted-foreground">
        {getRelativeTime(timestamp)}
      </div>
      {!localseen && (
        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
      )}
    </div>
  );
};

export default Notification;