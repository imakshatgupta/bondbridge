import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/index';
import { setActiveChat } from '@/store/chatSlice';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';
import SidebarAvatar from '../profile/SidebarAvatar';
import { Button } from '../ui/button';

const ChatPage: React.FC = () => {
  const dispatch = useDispatch();
  const activeChat = useSelector((state: RootState) => state.chat.activeChat);

  const handleCloseChat = () => {
    dispatch(setActiveChat(null));
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <ChatList />
      </div>
      
      {activeChat ? (
        <div className="w-2/3">
          <ChatInterface 
            chatId={activeChat.id}
            name={activeChat.name}
            avatar={activeChat.avatar}
            onClose={handleCloseChat}
          />
        </div>
      ) : (
        <div className="p-5 w-2/3 px-12 space-y-6 *:rounded-xl">
          {/* People Section - Same as in Layout.tsx */}
          <div className="p-4 border-2 border-sidebar-border">
            <div className="flex flex-col items-center">
              <img src="/profile/avatars/2.png" alt="Profile" className="w-20 h-20 rounded-full mb-2 border-2 border-sidebar-border" />
              <h3 className="font-semibold text-xl text-sidebar-foreground">France Leaphart</h3>
              <p className="text-sidebar-foreground/60">UI/UX Designer</p>
              <Button variant={'outline'} className='mt-2 text-sidebar-primary text-sm font-medium border-primary w-full'>
                View Profile
              </Button>
            </div>
          </div>

          <div className="p-6 border-2 overflow-y-auto max-h-[52vh] app-scrollbar">
            <h3 className="font-semibold text-lg mb-4 text-sidebar-foreground">People</h3>
            <ul className="space-y-3">
              <SidebarAvatar/>
              <SidebarAvatar/>
              <SidebarAvatar/>
              <SidebarAvatar/>
              <SidebarAvatar/>
              <SidebarAvatar/>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage; 