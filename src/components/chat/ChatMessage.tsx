import { Message } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChatMessageProps {
  message: Message;
  showAvatar: boolean;
}

export const ChatMessage = ({ message, showAvatar }: ChatMessageProps) => {
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
          <p className='break-all'>{message.text}</p>
          <span className={`text-[10px] opacity-70 block ${message.isUser ? 'text-right' : 'text-left'} mt-3`}>
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}; 