import { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { setActiveChat, ChatItem } from "@/store/chatSlice";
import { useAppSelector, useAppDispatch } from "../../store";

const ChatList = () => {
  const dispatch = useAppDispatch();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const token = localStorage.getItem("token");
  const { userId } = useAppSelector(state => state.createProfile);

  console.log("userId:", userId);
  console.log("token:", token);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/get-all-chat-rooms", {
          headers: {
            'token': token,
            'userid': userId,
          },
        });

        console.log("API Response:", response.data); // Debug log

        const chatRooms = response.data.chatRooms;

        // Filter and map chat rooms safely
        const filteredChats = chatRooms
          .filter((chatRoom: any) => chatRoom.roomType === "dm")
          .map((chatRoom: any) => ({
            id: chatRoom.chatRoomId,
            name: chatRoom.participants?.[0]?.name,
            avatar: chatRoom.participants?.[0]?.profilePic,
            lastMessage: typeof chatRoom.lastMessage === "string"
              ? chatRoom.lastMessage
              : chatRoom.lastMessage?.text || "No messages yet",
            timestamp: new Date(chatRoom.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: chatRoom.unread || false,
          }));

        setChats(filteredChats);
      } catch (error) {
        console.error("Failed to fetch chats", error);
      }
    };
    fetchChats();
  }, []);

  const handleChatSelect = (chat: ChatItem) => {
    dispatch(setActiveChat(chat));
  };

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <div 
          key={chat?.id} 
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
          onClick={() => handleChatSelect(chat)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat?.avatar} alt={chat?.name} />
              <AvatarFallback>{chat?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn("font-medium", chat?.unread && "font-semibold")}>{chat?.name}</h3>
                {chat?.unread && (
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {chat?.lastMessage}
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{chat?.timestamp}</span>
        </div>
      ))}
    </div>
  );
};

export default ChatList;