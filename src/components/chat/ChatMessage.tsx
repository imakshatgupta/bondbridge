import { Message } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isPostShare, parsePostShare } from '@/utils/messageUtils';

interface ChatMessageProps {
  message: Message;
  showAvatar: boolean;
}

// Interface for shared post data
interface SharedPostData {
  _id: string;
  author: string;
  data: {
    content: string;
    media?: Array<{
      url: string;
      type: string;
    }>;
  };
  feedId: string;
  communityId?: string;
  isCommunity?: boolean;
  name: string;
}

export const ChatMessage = ({ message, showAvatar }: ChatMessageProps) => {
  // State for parsed shared post
  const [sharedPost, setSharedPost] = useState<SharedPostData | null>(null);
  
  // Check for and parse shared post on message change
  useEffect(() => {
    if (isPostShare(message.text)) {
      const parsedPost = parsePostShare(message.text as string);
      setSharedPost(parsedPost);
    } else {
      setSharedPost(null);
    }
  }, [message.text]);
  
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${message.isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 w-full`}>
        {showAvatar && message.avatar && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.avatar} alt={message.username || 'User'} />
            <AvatarFallback>{message.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        )}
        <div 
          className={`max-w-[70%] p-3 rounded-lg ${
            message.isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground'
          }`}
        >
          {/* Render shared post if available */}
          {sharedPost ? (
            <div className="shared-post">
              <div className="border rounded-md overflow-hidden bg-background text-foreground mb-2">
                {/* Post image if available */}
                {sharedPost.data.media && 
                 sharedPost.data.media.length > 0 && 
                 sharedPost.data.media[0].type === 'image' && (
                  <div className="w-full h-[150px] overflow-hidden">
                    <img 
                      src={sharedPost.data.media[0].url} 
                      alt="Shared post"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load shared post image");
                        // Replace with default image on error
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                )}
                
                {/* Post content */}
                <div className="p-2">
                  <p className="text-xs font-medium mb-1 text-foreground">
                    Shared a post from {sharedPost.name || 'Unknown'}
                  </p>
                  <p className="text-sm line-clamp-2 text-foreground">
                    {sharedPost.data.content || 'No caption'}
                  </p>
                  <Link 
                    to={sharedPost.isCommunity && sharedPost.communityId 
                      ? `/community/${sharedPost.communityId}/${sharedPost._id}` 
                      : `/post/${sharedPost._id}`} 
                    className="flex items-center gap-1 text-xs text-primary mt-1"
                  >
                    View Post <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <p className='break-all'>{typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}</p>
          )}
          
          <span className={`text-[10px] opacity-70 block ${message.isUser ? 'text-right' : 'text-left'} mt-3`}>
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}; 