import React, { useRef, useEffect } from "react";
import { Message as MessageType } from "@/store/chatSlice";
import Message from "./Message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatType } from "@/types/chat";

interface MessageListProps {
  messages: MessageType[];
  isLoadingMessages: boolean;
  isTyping: boolean;
  typingUser: {
    name: string;
    profilePic?: string;
  } | null;
  chatType: ChatType;
  userId: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoadingMessages,
  isTyping,
  typingUser,
  chatType,
  userId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  if (isLoadingMessages) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        <p>No Messages Yet. Start a Conversation!</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto px-4">
      <div className="py-4 space-y-3">
        {messages.map((message, index) => {
          const isPreviousDifferentSender =
            index === 0 ||
            messages[index - 1].senderName !== message.senderName;

          return (
            <Message
              key={message.id}
              message={message}
              isFirstInSequence={isPreviousDifferentSender}
              isGroupChat={chatType === "group"}
              userId={userId}
            />
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-2">
            <Avatar className="h-6 w-6 mt-1">
              <AvatarImage
                src={typingUser?.profilePic || ""}
                alt={typingUser?.name || "User"}
              />
              <AvatarFallback>{(typingUser?.name || "?")[0]}</AvatarFallback>
            </Avatar>
            <div className="bg-muted p-2 rounded-md text-sm rounded-tl-none">
              <span>typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList; 