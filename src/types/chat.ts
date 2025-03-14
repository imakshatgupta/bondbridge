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