import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { ArrowLeft, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage } from '@/components/chat/ChatMessage';

export default function BondChat() {
  const [messages, setMessages] = useState<Message[]>([
    // {
    //   id: 1,
    //   text: "Hey,\nI'm Bond Chat\nYour Favourite GPT At Work",
    //   timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    //   isUser: false,
    //   avatar: '/bondchat.svg',
    //   username: 'Bond Chat'
    // }
  ]);

  const [suggestions] = useState([
    "This is the for fast reply",
    "This is the suggestion for fast reply"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
      avatar: '/profile/user.png',
      username: 'You'
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: "I'm here to help! What would you like to know?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
        avatar: '/bondchat.svg',
        username: 'Bond Chat'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col bg-background relative h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/bondchat.svg" alt="Bond Chat" className="w-8 h-8" />
          <span className="font-medium grad">BondChat</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Basic</span>
        </div>
        <div className="ml-auto gap-2 flex items-center">
          <Button size="sm" variant="default" className="rounded-full">
            New +
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground">
            <History />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden h-full relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center h-full p-4 mb-20 font-bold capitalize text-6xl space-y-3">
            <h3 className=''>Hey, </h3>
            <h3 className=''>I'm <span className='grad'>BondChat</span></h3>
            <p className='text-muted-foreground font-normal text-xl'>Your Favourite GPT At Work</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 mb-20 ">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} showAvatar={false} />
            ))}
          <div ref={messagesEndRef} />
        </div>
        )}


        {/* Quick Suggestions */}
        <div className="px-4 relative -top-[75px]">
         {messages.length == 0 && <div className="text-sm text-muted-foreground mb-2">Quick suggestion</div>}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="bg-muted text-muted-foreground px-3 py-2 rounded-full text-xs"
                onClick={() => handleSendMessage(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            placeholder="Type Your Message Here..."
          />


        </div>
      </div>
    </div>
  );
} 