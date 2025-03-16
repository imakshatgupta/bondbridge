import { ChatProps } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

export const Chat = ({ 
  messages, 
  onSendMessage, 
  placeholder,
  avatar,
  username,
  showHeader = true,
  onClose,
  showAvatar = true
}: ChatProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {showHeader && (
        <div className="flex items-center gap-3 p-4 border-b">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {avatar  && username && (
            <div className="flex items-center gap-2">
              <img src={avatar} alt={username} className="w-8 h-8 rounded-full" />
              <span className="font-medium">{username}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} showAvatar={showAvatar} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSendMessage={onSendMessage}
        placeholder={placeholder}
      />
    </div>
  );
}; 