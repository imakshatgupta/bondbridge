import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatRoom } from "@/apis/apiTypes/response";
import { isPostShare } from "@/utils/messageUtils";

export interface ChatParticipantInfo {
  userId: string;
  name: string;
  profilePic: string;
  status?: string;
}

export interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  updatedAt: string;
  unread: boolean;
  type: "dm" | "group" | "community";
  bio?: string;
  admin?: string;
  participants: {
    userId: string;
    name: string;
    profilePic: string;
    status?: string;
  }[];
  memberCount?: number;
  backgroundImage?: string;
}

export interface Reaction {
  userId: string;
  reaction: string;
  timestamp: number;
}

export interface Message {
  id: string;
  text: string | object;
  timestamp: string;
  isUser: boolean;
  senderName?: string;
  senderAvatar?: string;
  senderId?: string;
  replyTo?: string;
  reactions?: Reaction[];
}

// export interface GroupItem {
//   id: string;
//   name: string;
//   image: string | null;
//   members: number;
//   lastActive: string;
// }

interface ChatState {
  activeChat: ChatItem | null;
  chats: ChatItem[];
  filteredChats: {
    dms: ChatItem[];
    groups: ChatItem[];
    communities: ChatItem[];
  };
  messages: Message[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isTyping: boolean;
}

const initialState: ChatState = {
  activeChat: null,
  chats: [],
  filteredChats: {
    dms: [],
    groups: [],
    communities: [],
  },
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  isTyping: false,
  //   {
  //   id: 1,
  //   name: 'Michel Smithwick',
  //   avatar: '/profile/user.png',
  //   lastMessage: 'Hey, Nice to connect with you!',
  //   timestamp: '2h',
  //   unread: true
  // }
};

// Define a type for the possible lastMessage formats
interface LastMessageWithText {
  text: string;
}

interface LastMessageWithContent {
  content: string;
  messageId?: string;
  timestamp?: number;
}

type LastMessageType = string | LastMessageWithText | LastMessageWithContent;

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<ChatItem | null>) => {
      state.activeChat = action.payload;
    },
    setChats: (state, action: PayloadAction<ChatItem[]>) => {
      state.chats = action.payload;
      // Update filtered chats
      state.filteredChats = {
        dms: action.payload.filter((chat) => chat.type === "dm"),
        groups: action.payload.filter((chat) => chat.type === "group"),
        communities: action.payload.filter((chat) => chat.type === "community"),
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingMessages: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMessages = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessageId: (
      state,
      action: PayloadAction<{ oldId: string; newId: string }>
    ) => {
      const { oldId, newId } = action.payload;
      const message = state.messages.find((msg) => msg.id === oldId);
      if (message) {
        message.id = newId;
      }
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    // Add a reaction to a message
    addReaction: (
      state,
      action: PayloadAction<{ messageId: string; reaction: Reaction }>
    ) => {
      const { messageId, reaction } = action.payload;
      const message = state.messages.find((msg) => msg.id === messageId);

      if (message) {
        if (!message.reactions) {
          message.reactions = [];
        }

        // Remove any existing reaction from this user to avoid duplicates
        message.reactions = message.reactions.filter(
          (r) => r.userId !== reaction.userId
        );

        // Add the new reaction
        message.reactions.push(reaction);
      }
    },
    // Remove a reaction from a message
    removeReaction: (
      state,
      action: PayloadAction<{ messageId: string; userId: string }>
    ) => {
      const { messageId, userId } = action.payload;
      const message = state.messages.find((msg) => msg.id === messageId);

      if (message && message.reactions) {
        message.reactions = message.reactions.filter(
          (r) => r.userId !== userId
        );
      }
    },
    // Transform chat rooms from API to ChatItem format
    transformAndSetChats: (
      state,
      action: PayloadAction<{ chatRooms: ChatRoom[]; currentUserId: string }>
    ) => {
      const { chatRooms, currentUserId } = action.payload;

      const transformedChats: ChatItem[] = chatRooms.map(
        (chatRoom: ChatRoom) => {
          // Map participants to our format
          const participants: ChatParticipantInfo[] = chatRoom.participants.map(
            (participant) => ({
              userId: participant.userId,
              name: participant.name,
              profilePic: participant.profilePic,
              status: participant.status,
            })
          );

          // Extract last message text from different possible formats
          let lastMessageText = "No Messages Yet";
          const lastMessage = chatRoom.lastMessage as LastMessageType;

          if (typeof lastMessage === "string") {
            // Check if the string message is a post share
            if (isPostShare(lastMessage)) {
              lastMessageText = "Shared a post";
            } else {
              lastMessageText = lastMessage;
            }
          } else if (lastMessage) {
            // Handle different possible formats of lastMessage
            if ("text" in lastMessage) {
              // Check if text property is a post share
              if (isPostShare(lastMessage.text)) {
                lastMessageText = "Shared a post";
              } else {
                lastMessageText = lastMessage.text;
              }
            } else if ("content" in lastMessage) {
              // Check if content property is a post share
              if (isPostShare(lastMessage.content)) {
                lastMessageText = "Shared a post";
              } else {
                lastMessageText = lastMessage.content;
              }
            }
          }

          if (chatRoom.roomType === "dm") {
            const otherParticipant =
              chatRoom.participants.find(
                (participant) => participant.userId !== currentUserId
              ) || chatRoom.participants[0];

            return {
              id: chatRoom.chatRoomId,
              name: otherParticipant?.name || "Unknown",
              avatar: otherParticipant?.profilePic || "",
              lastMessage: lastMessageText,
              updatedAt: chatRoom.updatedAt,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              unread: chatRoom.unseenCount > 0,
              type: "dm" as const,
              bio: chatRoom.bio,
              participants,
            };
          } else {            
            return {
              id: chatRoom.chatRoomId,
              name: chatRoom.groupName || "Group Chat",
              avatar: chatRoom.profileUrl || "",
              lastMessage: lastMessageText,
              updatedAt: chatRoom.updatedAt,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              unread: chatRoom.unseenCount > 0,
              type: chatRoom.roomType,
              bio: chatRoom.bio,
              admin: chatRoom.admin,
              participants,
            };
          }
        }
      );

      state.chats = transformedChats;
      state.filteredChats = {
        dms: transformedChats.filter((chat) => chat.type === "dm"),
        groups: transformedChats.filter((chat) => chat.type === "group"),
        communities: transformedChats.filter(
          (chat) => chat.type === "community"
        ),
      };
    },
    // Delete a group from the chat list
    deleteGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;

      // Remove from the main chats array
      state.chats = state.chats.filter((chat) => chat.id !== groupId);

      // Remove from the filtered groups
      state.filteredChats.groups = state.filteredChats.groups.filter(
        (group) => group.id !== groupId
      );

      // Clear activeChat if it's the deleted group
      if (state.activeChat?.id === groupId) {
        state.activeChat = null;
      }
    },
    // Restore a group when deletion fails
    restoreGroup: (state, action: PayloadAction<ChatItem>) => {
      const group = action.payload;

      // Add back to main chats array if not already there
      if (!state.chats.some((chat) => chat.id === group.id)) {
        state.chats.push(group);
      }

      // Add back to filtered groups if not already there
      if (!state.filteredChats.groups.some((g) => g.id === group.id)) {
        state.filteredChats.groups.push(group);
      }
    },
  },
});

export const {
  setActiveChat,
  setChats,
  setLoading,
  setLoadingMessages,
  setMessages,
  addMessage,
  updateMessageId,
  setIsTyping,
  transformAndSetChats,
  deleteGroup,
  restoreGroup,
  addReaction,
  removeReaction,
} = chatSlice.actions;

export default chatSlice.reducer;
