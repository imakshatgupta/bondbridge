export interface Message {
  id: number;
  text: string;
  timestamp: string;
  isUser: boolean;
}

export interface ChatInterfaceProps {
  chatId: number;
  name: string;
  avatar: string;
  onClose: () => void;
}