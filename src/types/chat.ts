export interface Message {
  id: number;
  text: string | object;
  timestamp: string;
  isUser: boolean;
  avatar: string;
  username: string;
  media?: string;
  senderId?: string;
}

export interface ChatInterfaceProps {
  chatId: number;
  name: string;
  avatar: string;
  onClose: () => void;
}

export interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  placeholder?: string;
  avatar?: string;
  username?: string;
  showHeader?: boolean;
  onClose?: () => void;
  showAvatar?: boolean;
}

export type ChatType = 'dm' | 'group' | 'community';

export interface ChatParticipant {
  userId: string;
  name: string;
  profilePic: string;
  status?: 'active' | 'left';
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  type: ChatType;
  participants: ChatParticipant[];
  admin?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount?: number;
}

export interface ChatInputRef {
  focus: () => void;
  clear: () => void;
}
