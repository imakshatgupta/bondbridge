import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ThreeDotsMenu from "@/components/global/ThreeDotsMenu";
import { MenuItemProps } from "@/components/global/ThreeDotsMenu";

interface ChatHeaderProps {
  name: string;
  avatar: string;
  chatType: string;
  participantsCount?: number;
  onClose: () => void;
  onProfileClick: () => void;
  menuItems: MenuItemProps[];
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  chatType,
  participantsCount,
  onClose,
  onProfileClick,
  menuItems
}) => {
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
            <AvatarFallback>
              {chatType === "dm" ? (
                name?.[0]
              ) : (
                <img 
                  src="/activity/group.svg" 
                  alt="Group" 
                  className="theme-svg w-full h-full p-2" 
                />
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {chatType === "dm"
                ? "Online"
                : `${chatType.charAt(0).toUpperCase() + chatType.slice(1)} · ${participantsCount} Members`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThreeDotsMenu items={menuItems} />
      </div>
    </div>
  );
};

export default ChatHeader;