import { useState, useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import {
  ArrowLeft,
  // History,
  Volume2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput, ChatInputRef } from "@/components/chat/ChatInput";
import { useSocket } from "@/context/SocketContext";
import { useApiCall } from "@/apis/globalCatchError";
import { getMessages, startMessage } from "@/apis/commonApiCalls/chatApi";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setActiveChat } from "@/store/chatSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoLoader from "@/components/LogoLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { stopAllRecognitionInstances } from "@/types/speech-recognition";

// Extend the Message type to support complex content
interface ExtendedMessage extends Omit<Message, "text"> {
  text: string | MessageContent;
  media?: string;
  senderId?: string;
}

interface UserRecommendation {
  _id: string;
  name: string;
  nickName: string;
  profilePic: string;
  interests: string[];
  matchingInterestsCount: number;
  hasMessageInterest: boolean;
}

interface MessageContent {
  message: string;
  users?: UserRecommendation[];
}

interface MessageResponse {
  _id?: string;
  content: string | MessageContent;
  senderId: string;
  timestamp?: number;
  chatId?: string;
  senderName?: string;
  senderAvatar?: string;
  isBot?: boolean;
  media?: string;
}

// Interface for message objects in the API response
interface MessageHistoryItem {
  _id: string;
  content: string | MessageContent;
  senderId: string;
  createdAt: string;
  media?: string;
}

interface SendMessageResponse {
  success: boolean;
  message?: string;
  data?: {
    _id: string;
    content: string;
    timestamp: number;
  };
}

// Custom component for user recommendation cards
const UserCard = ({ user, onNavigate }: { user: UserRecommendation, onNavigate: (path: string) => void }) => {
  // Display up to 3 interests with a "+n more" indicator if needed
  const displayedInterests = user.interests.slice(0, 3);
  const remainingCount = Math.max(0, user.interests.length - 3);

  return (
    <div 
      className="flex items-start border-2 border-primary/25 gap-3 p-4 bg-muted/50 rounded-lg mb-2 hover:bg-muted transition-colors cursor-pointer"
      onClick={() => onNavigate(`/profile/${user._id}`)}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.profilePic} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <span className="font-medium">{user.name}</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {displayedInterests.map((interest, index) => (
            <Badge
              key={`${index}-${user._id}`}
              variant="outline"
              className="text-xs border-primary"
            >
              {interest}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="text-xs border-primary">
              +{remainingCount} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom component for rendering bot messages with potential user recommendations
const BotMessage = ({
  message,
  messageIndex,
  onNavigate
}: {
  message: ExtendedMessage;
  messageIndex: number;
  onNavigate: (path: string) => void;
}) => {
  // Check if the message has content that includes user recommendations
  const hasUserRecommendations =
    typeof message.text === "object" &&
    "users" in message.text &&
    Array.isArray(message.text.users);

  // Extract the message text and user recommendations if available
  const messageText = hasUserRecommendations
    ? (message.text as MessageContent).message
    : typeof message.text === "string"
    ? message.text
    : "";

  const users = hasUserRecommendations
    ? (message.text as MessageContent).users || []
    : [];

  return (
    <div className="flex items-start gap-2 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src="/bondchat.svg" alt="Bond Chat" />
        <AvatarFallback>BC</AvatarFallback>
      </Avatar>
      <div className="flex-1 max-w-[80%]">
        <div className="bg-muted p-3 rounded-lg text-foreground rounded-tl-none">
          <p className="break-all">{messageText}</p>
          <span className="text-xs opacity-70 block text-right mt-1">
            {message.timestamp}
          </span>
        </div>

        {users.length > 0 && (
          <div className="mt-2">
            {users.map((user, index) => {
              const key = `${messageIndex}-user-${index}-${user._id}`;
              return <UserCard key={key} user={user} onNavigate={onNavigate} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Custom component for user messages
const UserMessage = ({ message }: { message: ExtendedMessage }) => {
  return (
    <div className="flex items-start gap-2 mb-4 flex-row-reverse">
      <div className="bg-primary p-3 rounded-lg text-primary-foreground rounded-tr-none max-w-[70%]">
        <p className="break-all">
          {typeof message.text === "string" ? message.text : ""}
        </p>
        <span className="text-xs opacity-70 block text-right mt-1  ">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};

export default function BondChat() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [voiceType, setVoiceType] = useState<"male" | "female">("male"); // Default voice type is male
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const isSpeakerOnRef = useRef(false); // Add a ref to track current speaker state
  const voiceTypeRef = useRef<"male" | "female">("male"); // Ref for voice type
  
  // Add new state for speech recognition active
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // Add ref for ChatInput component
  const chatInputRef = useRef<ChatInputRef>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();
  const [executeGetMessages] = useApiCall(getMessages);
  const [executeStartMessage] = useApiCall(startMessage);
  const userId = localStorage.getItem("userId") || "";
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const BOT_ID = import.meta.env.VITE_BOT_ID; // Access the bot ID from environment variables
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Update refs when states change
  useEffect(() => {
    isSpeakerOnRef.current = isSpeakerOn;
  }, [isSpeakerOn]);

  useEffect(() => {
    voiceTypeRef.current = voiceType;
  }, [voiceType]);

  // Set activeChat to null when component mounts
  useEffect(() => {
    dispatch(setActiveChat(null));

    // Cleanup when component unmounts
    return () => {
      // Make sure all speech recognition instances are stopped
      stopAllRecognitionInstances();
    };
  }, [dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to toggle the speaker state
  const toggleSpeaker = () => {
    const newSpeakerState = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerState);

    // Stop any current audio playback when turning off
    if (!newSpeakerState && audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      setAudioRef(null);
      setIsAudioPlaying(false);
    }
  };

  // Function to select voice type
  const selectVoice = (type: "male" | "female") => {
    setVoiceType(type);
  };

  // Function to play audio from base64 string when received
  const playAudioFromBase64 = (base64Audio: string) => {
    if (!isSpeakerOnRef.current || !base64Audio) return;

    try {
      // Stop any current audio
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }

      // Create audio source from base64
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      setAudioRef(audio);
      
      // Set up event handlers
      audio.onplaying = () => {
        setIsAudioPlaying(true);
      };
      
      audio.onended = audio.onpause = () => {
        setIsAudioPlaying(false);
      };

      audio.onerror = () => {
        setAudioRef(null);
        setIsAudioPlaying(false);
        toast.error("Audio playback failed");
      };

      // Play the audio
      audio.play().catch((error) => {
        console.error("Audio playback error:", error);
        toast.error("Failed to play audio");
        setAudioRef(null);
        setIsAudioPlaying(false);
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      toast.error("Failed to process audio data");
      setIsAudioPlaying(false);
    }
  };

  // Socket connection and message fetching effect
  useEffect(() => {
    if (!socket || !isConnected || !userId) return;

    // Initialize the chat with the bot
    const initializeChat = async () => {
      setIsLoading(true);
      
      // First call start-message API to get or create the chat room
      const startMessageResult = await executeStartMessage({
        userId2: BOT_ID, // Use the bot ID from environment variables
      });

      if (startMessageResult.success && startMessageResult.data) {
        const roomId = startMessageResult.data.chatRoom.chatRoomId;
        setChatRoomId(roomId);
        console.log("Chat initialized with room ID:", roomId);
        
        // Join the room
        socket.emit("join", roomId);
        
        // Now fetch messages for this room
        const result = await executeGetMessages({
          roomId,
          page: 1,
          limit: 50,
        });

        if (result.success && result.data) {
          const messageHistory = result.data.messages
            .map((msg: MessageHistoryItem) => {
              // Try to parse content if it's a string that might be JSON
              let parsedContent: string | MessageContent = msg.content;
              if (typeof msg.content === "string") {
                try {
                  const possibleJson = JSON.parse(msg.content);
                  if (possibleJson && typeof possibleJson === "object") {
                    parsedContent = possibleJson as MessageContent;
                  }
                } catch {
                  // Not JSON, keep as string
                }
              }

              return {
                id: parseInt(msg._id) || Date.now(),
                text: parsedContent,
                timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isUser: msg.senderId === userId,
                avatar:
                  msg.senderId === userId
                    ? "/profile/user.png"
                    : "/bondchat.svg",
                username: msg.senderId === userId ? "You" : "Bond Chat",
                media: msg.media,
              };
            })
            .reverse(); // Reverse to show newest at the bottom
          setMessages(messageHistory);
        }
      } else {
        toast.error("Failed to initialize chat");
        console.error("Start message failed:", startMessageResult);
      }
      
      setIsLoading(false);
    };

    initializeChat();

    // Set up socket event listeners
    const handleReceiveMessage = (data: MessageResponse) => {
      console.log("Received message:", data);
      // Skip if it's our own message (we'll add it optimistically)
      if (data.senderId === userId) return;

      // Handle different content types
      let messageContent: string | MessageContent =
        typeof data.content === "string" ? data.content : data.content;

      // If content is a string but might be JSON, try to parse it
      if (typeof data.content === "string") {
        try {
          const possibleJson = JSON.parse(data.content);
          if (possibleJson && typeof possibleJson === "object") {
            messageContent = possibleJson as MessageContent;
          }
        } catch {
          console.log("Not JSON, keep as string");
        }
      }

      const newMsg: ExtendedMessage = {
        id: data._id ? parseInt(data._id) : Date.now(),
        text: messageContent,
        timestamp: new Date(
          data.timestamp ? data.timestamp * 1000 : Date.now()
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isUser: false,
        avatar: "/bondchat.svg",
        username: "Bond Chat",
        media: data.media, // Store audio data from Polly if available
      };

      setMessages((prev) => [...prev, newMsg]);

      console.log("isSpeakerOn state:", isSpeakerOn);
      console.log("isSpeakerOnRef.current:", isSpeakerOnRef.current);
      console.log("data.media:", data.media);

      // Play audio if speaker is on and we have audio data - use the ref value
      if (isSpeakerOnRef.current && data.media) {
        playAudioFromBase64(data.media);
      }
    };

    // Add event listeners
    socket.on("receiveMessage", handleReceiveMessage);

    // Clean up function
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      // Leave the room when component unmounts
      if (chatRoomId) {
        socket.emit("leave", chatRoomId);
      }
      // Clean up audio
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
        setIsAudioPlaying(false);
      }
    };
  }, [socket, isConnected, userId, BOT_ID]);

  // Effect to handle existing messages' audio when speaker toggle changes
  useEffect(() => {
    // If speaker is turned off, stop any playing audio
    if (!isSpeakerOn && audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      setAudioRef(null);
      setIsAudioPlaying(false);
    }
  }, [isSpeakerOn]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !socket || !isConnected || !chatRoomId) return;

    // Create message data
    const messageData = {
      senderId: userId,
      content: text,
      entityId: chatRoomId, // Use the roomId from start-message API
      media: null,
      entity: "chat",
      isBot: true, // Set isBot flag to true
      senderName: "You",
      senderAvatar: "/profile/user.png",
      isSpeakerOn: isSpeakerOnRef.current, // Use ref value to ensure latest state
      voice: voiceTypeRef.current, // Send voice type preference
    };

    // Add message to local state immediately for better UX
    const tempMessage: ExtendedMessage = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isUser: true,
      avatar: "/profile/user.png",
      username: "You",
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Send message through socket
    socket.emit("sendMessage", messageData, (response: SendMessageResponse) => {
      console.log("Message sent response:", response);
      if (!response.success) {
        toast.error("Failed to send message");
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // Update handleSpeechStateChange function to track speech recognition state
  const handleSpeechStateChange = (isActive: boolean) => {
    setIsSpeechActive(isActive);
  };

  // Add new function to handle navigation
  const handleNavigation = (path?: string) => {
    // Always clean up audio regardless of speech state
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      setIsAudioPlaying(false);
    }
    
    // Only turn off speech recognition if it's active
    if (isSpeechActive) {
      // Force stop speech recognition
      if (chatInputRef.current) {
        chatInputRef.current.forceStopListening();
      }
      stopAllRecognitionInstances();
      setIsSpeechActive(false);
    }
    
    // Navigate to the specified path or back
    if (path) {
      navigate(path);
    } else {
      navigate(-1);
    }
  };

  // Add confirmation dialog exit handler
  const handleConfirmExit = () => {
    setShowExitDialog(false);
    
    // First explicitly turn off speech recognition in the ChatInput component
    if (chatInputRef.current) {
      chatInputRef.current.forceStopListening();
    }
    
    // Clean up audio
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      setIsAudioPlaying(false);
    }
    
    // Make sure speech recognition is turned off and mic button is toggled off
    stopAllRecognitionInstances();
    setIsSpeechActive(false);
    
    // Use the navigate function from react-router instead of window.history.back()
    navigate(-1);
  };

  // Add a new useEffect to handle beforeunload event
  useEffect(() => {
    // Handle browser back button and page refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSpeechActive) {
        // Standard way to show a confirmation dialog when leaving page
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    // Handle browser navigation (history)
    const handlePopState = () => {
      // Only turn off speech recognition if it's active
      if (isSpeechActive && chatInputRef.current) {
        chatInputRef.current.forceStopListening();
        stopAllRecognitionInstances();
        setIsSpeechActive(false);
      }
      
      // Note: No need to call navigate here as the browser will handle the navigation
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSpeechActive]);

  return (
    <div className="flex flex-col bg-background relative h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // Always clean up audio regardless of speech state
            if (audioRef) {
              audioRef.pause();
              audioRef.currentTime = 0;
              setIsAudioPlaying(false);
            }
            
            // Only turn off speech recognition if it's active
            if (isSpeechActive) {
              // Force stop any speech recognition
              if (chatInputRef.current) {
                chatInputRef.current.forceStopListening();
              }
              stopAllRecognitionInstances();
              setIsSpeechActive(false);
            }
            
            // Always navigate back using react-router
            navigate(-1);
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/bondchat.svg" alt="Bond Chat" className="w-8 h-8" />
          <span className="font-medium grad">BondChat</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            Basic
          </span>
        </div>
        <div className="ml-auto gap-2 flex items-center">
          {/* <Button
            size="sm"
            variant="default"
            className="rounded-full cursor-pointer"
          >
            New +
          </Button> */}
          <div className="flex items-center">
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-full text-muted-foreground cursor-pointer ${
                isSpeakerOn ? "text-primary" : ""
              }`}
              onClick={toggleSpeaker}
              // disabled={messages.length === 0}
            >
              <Volume2 className="h-5 w-5" />
            </Button>

            {isSpeakerOn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-1 h-8 px-2 cursor-pointer">
                    {voiceType === "male" ? "Michael" : "Vanessa"}
                    <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => selectVoice("male")}>
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        voiceType === "male" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    Michael
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => selectVoice("female")}>
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        voiceType === "female" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    Vanessa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {/* <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-muted-foreground cursor-pointer"
          >
            <History />
          </Button> */}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden h-full relative">
        {messages.length === 0 && !isLoading ? (
          <div className="flex-1 flex flex-col justify-center h-full p-4 mb-20 font-bold capitalize text-6xl space-y-3">
            <h3 className="">Welcome, </h3>
            <h3 className="">
              To <span className="grad">BondChat</span>
            </h3>
            <p className="text-muted-foreground font-normal text-xl">
              Choose your persona
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 mb-20">
            {isLoading ? (
              <div className="flex flex-col justify-center h-full opacity-80 transition-opacity duration-300">
                <LogoLoader size="md" pulseSpeed={1.5} opacity={0.7} />
              </div>
            ) : (
              <div className="animate-in fade-in-0 duration-300">
                {messages.map((message, index) =>
                  message.isUser ? (
                    <UserMessage key={index} message={message} />
                  ) : (
                    <BotMessage
                      key={index}
                      message={message}
                      messageIndex={index}
                      onNavigate={handleNavigation}
                    />
                  )
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            placeholder={isLoading ? "Loading conversation..." : "Type Your Message Here..."}
            disabled={isLoading}
            isAudioPlaying={isAudioPlaying}
            expectAudioAfterSend={isSpeakerOn}
            onSpeechStateChange={handleSpeechStateChange}
            ref={chatInputRef}
          />
        </div>
      </div>

      {/* Add confirmation dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Speech Recognition Active</DialogTitle>
            <DialogDescription>
              You currently have speech recognition (microphone) active. If you leave now, your recording will be stopped. Would you like to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExitDialog(false)}
            >
              Stay on Page
            </Button>
            <Button
              type="button" 
              variant="destructive"
              onClick={handleConfirmExit}
            >
              Leave Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
