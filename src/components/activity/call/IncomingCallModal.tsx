import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, PhoneOff } from "lucide-react";
import { useCall } from "@/context/CallContext";

interface IncomingCallModalProps {
  open: boolean;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ open }) => {
  const { incomingCall, answerCall, rejectCall } = useCall();

  // console.log("incomingCall, answerCall, rejectCall: ", incomingCall, answerCall, rejectCall); // perfect
  
  // Debug incoming call data
  console.log("Incoming call data:", incomingCall ? {
    type: incomingCall.type,
    from: incomingCall.userId,
    name: incomingCall.senderInfo?.name,
    callId: incomingCall.callId
  } : "No incoming call");

  if (!incomingCall) return null;

  const handleAnswerCall = async () => {
    // Log before answering
    console.log("Answering call of type:", incomingCall.type || "audio");
    
    // Make sure call type is preserved
    const callData = {
      ...incomingCall,
      type: incomingCall.type || "audio" // Ensure type is set
    };
    
    await answerCall(callData);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Incoming Call</DialogTitle>
          <DialogDescription className="text-center">
            {incomingCall.type === "video" ? "Video Call" : "Audio Call"} from {incomingCall.senderInfo?.name || "Unknown"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={incomingCall.senderInfo?.avatar || ""} 
              alt={incomingCall.senderInfo?.name || "Unknown"} 
            />
            <AvatarFallback>
              {incomingCall.senderInfo?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-medium">{incomingCall.senderInfo?.name || "Unknown"}</h3>
        </div>
        <div className="flex justify-center gap-4">
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-14 w-14 rounded-full"
            onClick={() => rejectCall(incomingCall)}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
            onClick={handleAnswerCall}
          >
            {incomingCall.type === "video" ? 
              <Video className="h-6 w-6" /> : 
              <Phone className="h-6 w-6" />
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallModal; 