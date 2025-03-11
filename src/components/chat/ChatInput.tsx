import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ArrowRight, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
}

export const ChatInput = ({ onSendMessage, placeholder = 'Type your message...' }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-3 flex items-center gap-2">
      <div className="flex-1 flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2">
        <Paperclip className="h-5 w-5 text-muted-foreground/60" />
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          className="flex-1 border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
        <Mic className="h-5 w-5 text-muted-foreground/60" />
      </div>
      <Button 
        onClick={handleSend}
        disabled={!message.trim()}
        className="rounded-full aspect-square h-11 w-11 bg-primary"
      >
        <ArrowRight className="h-full w-full" />
      </Button>
    </div>
  );
}; 