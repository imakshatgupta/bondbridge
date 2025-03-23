import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Message as MessageType } from "@/store/chatSlice";

interface MessageProps {
  message: MessageType;
  isFirstInSequence: boolean;
  isGroupChat: boolean;
  userId: string;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  isFirstInSequence, 
  isGroupChat, 
  userId 
}) => {
  return (
    <div
      className={`flex items-start gap-2 ${message.isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Only show avatar for group chats and for the first message in a sequence from each sender */}
      {isGroupChat && isFirstInSequence && (
        <Link
          to={`/profile/${message.isUser ? userId : message.senderId}`}
        >
          <Avatar className="h-6 w-6 mt-1">
            <AvatarImage
              src={message.senderAvatar || ""}
              alt={message.senderName || "Unknown"}
            />
            <AvatarFallback>
              {(message.senderName || "?")[0]}
            </AvatarFallback>
          </Avatar>
        </Link>
      )}
      {/* Add a spacer when we don't show the avatar to keep alignment */}
      {isGroupChat && !isFirstInSequence && (
        <div className="w-7" />
      )}
      <div
        className={`max-w-[70%] p-3 break-words ${message.isUser
            ? `bg-primary text-primary-foreground ${isFirstInSequence
              ? "rounded-sm rounded-tr-2xl"
              : "rounded-sm"
            }`
            : `bg-muted text-foreground ${isFirstInSequence
              ? "rounded-sm rounded-tl-2xl"
              : "rounded-sm"
            }`
          }`}
      >
        {/* Show sender name only for group chats and first message from each sender */}
        {isGroupChat &&
          !message.isUser &&
          isFirstInSequence && (
            <p className="text-xs font-medium mb-1">
              {message.senderName || "Unknown"}
            </p>
          )}
        <p>{message.text}</p>
        <span className="text-xs opacity-70 block text-right mt-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};

export default Message; 