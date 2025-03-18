import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { setActiveChat, ChatItem } from "@/store/chatSlice";
import { useAppDispatch } from "../../store";

interface ChatListProps {
  chats: ChatItem[];
  isLoading: boolean;
  onSelectChat: (chat: ChatItem) => void;
}

const ChatList = ({ chats, isLoading, onSelectChat }: ChatListProps) => {
  const dispatch = useAppDispatch();

  const handleChatSelect = (chat: ChatItem) => {
    dispatch(setActiveChat(chat));
    onSelectChat(chat);
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading chats...</div>;
  }

  return (
    <div className="space-y-1 ">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
          onClick={() => handleChatSelect(chat)}
        >
          <div className="flex items-center gap-3 max-w-[calc(100%-130px)]">
            <Avatar className="h-12 w-12 ">
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback>{chat.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="max-w-full">
              <div className="flex items-center gap-2">
                <h3
                  className={cn("font-medium", chat.unread && "font-semibold")}
                >
                  {chat.name}
                </h3>
                {chat.unread && (
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {chat.lastMessage}
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {chat.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
