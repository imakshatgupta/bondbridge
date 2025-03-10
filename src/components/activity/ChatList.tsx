// import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useDispatch } from 'react-redux';
import { setActiveChat, ChatItem } from '@/store/chatSlice';

const chats: ChatItem[] = [
  {
    id: 1,
    name: 'Michel Smithwick',
    avatar: '/profile/user.png',
    lastMessage: 'Hey, Nice to connect with you!',
    timestamp: '2h',
    unread: true
  },
  {
    id: 2,
    name: 'Alidia Leaton',
    avatar: '/profile/user.png',
    lastMessage: 'You: 📷 Photo',
    timestamp: '1d',
    unread: false
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    avatar: '/profile/user.png',
    lastMessage: 'Looking forward to our meeting tomorrow!',
    timestamp: '3h',
    unread: true
  },
  {
    id: 4,
    name: 'David Chen',
    avatar: '/profile/user.png',
    lastMessage: 'You: Sounds good!',
    timestamp: '2d',
    unread: false
  }
];

const ChatList = () => {
  const dispatch = useDispatch();

  const handleChatSelect = (chat: ChatItem) => {
    dispatch(setActiveChat(chat));
  };

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <div 
          key={chat.id} 
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
          onClick={() => handleChatSelect(chat)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback>{chat.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn("font-medium", chat.unread && "font-semibold")}>{chat.name}</h3>
                {chat.unread && (
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{chat.lastMessage}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
        </div>
      ))}
    </div>
  );
};

export default ChatList; 