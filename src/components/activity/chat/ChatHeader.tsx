import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video } from "lucide-react";
import ThreeDotsMenu from "@/components/global/ThreeDotsMenu";
import { MenuItemProps } from "@/components/global/ThreeDotsMenu";
import { CallButton } from "../call";
import { useSocket } from "@/context/SocketContext";

interface ChatHeaderProps {
  name: string;
  avatar: string;
  chatType: string;
  participantsCount?: number;
  onClose: () => void;
  onProfileClick: () => void;
  menuItems: MenuItemProps[];
  userId?: string; // Current user ID
  otherId?: string; // Other user ID for DMs
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  chatType,
  participantsCount,
  onClose,
  onProfileClick,
  menuItems,
  userId,
  otherId
}) => {
  const { isConnected } = useSocket();
  console.log(userId, otherId, isConnected);
  const showCallButtons = chatType === "dm" && userId && otherId && isConnected;
  console.log(showCallButtons);

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div
          className={`flex items-center gap-3 ${chatType === "dm" || chatType === "group" ? "cursor-pointer" : ""}`}
          onClick={onProfileClick}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {chatType === "dm"
                ? "online"
                : `${chatType} · ${participantsCount} members`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showCallButtons && (
          <>
            <CallButton 
              userId={userId} 
              otherId={otherId} 
              type="audio" 
              variant="ghost"
              size="icon"
            />
            <CallButton 
              userId={userId} 
              otherId={otherId} 
              type="video" 
              variant="ghost"
              size="icon"
            />
          </>
        )}
        <ThreeDotsMenu items={menuItems} />
      </div>
    </div>
  );
};

export default ChatHeader; 