import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video } from "lucide-react";
import { useCall } from "@/context/CallContext";
import { useSocket } from "@/context/SocketContext";

interface CallButtonProps {
  userId: string;
  otherId: string;
  type?: "audio" | "video";
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const CallButton: React.FC<CallButtonProps> = ({
  userId,
  otherId,
  type = "audio",
  variant = "ghost",
  size = "icon",
  className = "",
}) => {
  const { initializeCall } = useCall();
  const { isConnected } = useSocket();

  const handleCall = async () => {
    if (!isConnected) {
      console.error("Socket not connected. Cannot initiate call.");
      return;
    }

    console.log("initializing call: ", userId, otherId, type); // perfect
    
    await initializeCall(userId, otherId, type);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCall}
      disabled={!isConnected}
      className={className}
      aria-label={`${type === "video" ? "Video" : "Audio"} call`}
    >
      {type === "video" ? (
        <Video className="h-4 w-4" />
      ) : (
        <Phone className="h-4 w-4" />
      )}
    </Button>
  );
};

export default CallButton; 