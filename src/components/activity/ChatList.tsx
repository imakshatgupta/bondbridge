import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { setActiveChat, ChatItem } from "@/store/chatSlice";
import { useAppDispatch } from "../../store";
import { useApiCall } from "@/apis/globalCatchError";
import { fetchChatRooms } from "@/apis/commonApiCalls/activityApi";
import { ChatRoom } from "@/apis/apiTypes/response";

const ChatList = () => {
  const dispatch = useAppDispatch();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [executeFetchChats, isLoading] = useApiCall(fetchChatRooms);

  useEffect(() => {
    const loadChats = async () => {
      const result = await executeFetchChats();
      if (result.success && result.data) {
        const transformedChats: ChatItem[] = result.data.chatRooms.map(
          (chatRoom: ChatRoom) => {
            if (chatRoom.roomType === "dm") {
              const otherParticipant = chatRoom.participants[0];
              return {
                id: chatRoom.chatRoomId,
                name: otherParticipant?.name,
                avatar: otherParticipant?.profilePic,
                lastMessage:
                  typeof chatRoom.lastMessage === "string"
                    ? chatRoom.lastMessage
                    : chatRoom.lastMessage?.text || "No messages yet",
                timestamp: new Date(chatRoom.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                unread: chatRoom.unseenCount > 0,
                type: "dm" as const,
              };
            } else {
              return {
                id: chatRoom.chatRoomId,
                name: chatRoom.groupName,
                avatar: chatRoom.profileUrl || "",
                lastMessage:
                  typeof chatRoom.lastMessage === "string"
                    ? chatRoom.lastMessage
                    : chatRoom.lastMessage?.text || "No messages yet",
                timestamp: new Date(chatRoom.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                unread: chatRoom.unseenCount > 0,
                type: chatRoom.roomType,
                admin: chatRoom.admin,
              };
            }
          }
        );
        setChats(transformedChats);
      }
    };
    loadChats();
  }, []);

  const handleChatSelect = (chat: ChatItem) => {
    dispatch(setActiveChat(chat));
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading chats...</div>;
  }

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
              <AvatarFallback>{chat.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
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
              <p className="text-sm text-muted-foreground line-clamp-1">
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
