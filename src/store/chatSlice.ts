import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatItem {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface ChatState {
  activeChat: ChatItem | null;
}

const initialState: ChatState = {
  activeChat:   {
    id: 1,
    name: 'Michel Smithwick',
    avatar: '/profile/user.png',
    lastMessage: 'Hey, Nice to connect with you!',
    timestamp: '2h',
    unread: true
  }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<ChatItem | null>) => {
      state.activeChat = action.payload;
    }
  }
});

export const { setActiveChat } = chatSlice.actions;
export default chatSlice.reducer; 