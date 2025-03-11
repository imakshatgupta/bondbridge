import { Chat } from '../chat/Chat';
import { Message } from '@/types/chat';
import { useState } from 'react';

interface ChatInterfaceProps {
  chatId: number;
  name: string;
  avatar: string;
  onClose: () => void;
}

const ChatInterface = ({ name, avatar, onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello, how are you?',
      timestamp: '12:00 PM',
      isUser: true,
      avatar,
      username: name
    },
    {
      id: 2,
      text: 'I am fine, thank you!',
      timestamp: '12:01 PM',
      isUser: false,
      avatar: '/bondchat.svg',
      username: 'Bond Chat'
    }
  ]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
      avatar,
      username: name
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <Chat
      messages={messages}
      onSendMessage={handleSendMessage}
      avatar={avatar}
      username={name}
      onClose={onClose}
      showAvatar={false}
    />
  );
};

export default ChatInterface; 