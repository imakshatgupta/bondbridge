export interface Message {
  id: number;
  text: string;
  timestamp: string;
  isUser: boolean;
  avatar: string;
  username: string;
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