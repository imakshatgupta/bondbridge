import React, { useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import {
  Message,
  addMessage,
  setActiveChat,
  setIsTyping,
  setLoadingMessages,
  setMessages,
} from "@/store/chatSlice";
import { useApiCall } from "@/apis/globalCatchError";
import { getMessages } from "@/apis/commonApiCalls/chatApi";
import { useAppDispatch, useAppSelector } from "@/store";
import { useState } from "react";

// Define types for socket responses
interface MessageResponse {
  _id?: string;
  content: string;
  senderId: string;
  timestamp?: number;
  chatId?: string;
}

interface TypingResponse {
  chatId: string;
  senderId: string;
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

const ChatInterface: React.FC = () => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const userId = localStorage.getItem("userId") || "";
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [executeGetMessages] = useApiCall(getMessages);

  const dispatch = useAppDispatch();
  const {
    activeChat: chat,
    messages,
    isLoadingMessages,
    isTyping,
  } = useAppSelector((state) => state.chat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessageHistory = async () => {
      if (!chat || !chat.id) {
        console.error("Invalid chat object:", chat);
        return;
      }

      dispatch(setLoadingMessages(true));
      const result = await executeGetMessages({
        roomId: chat.id,
        page: 1,
        limit: 50,
      });

      if (result.success && result.data) {
        const messageHistory = result.data.messages
          .map((msg) => ({
            id: msg._id,
            text: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isUser: msg.senderId === userId,
          }))
          .reverse(); // Reverse the order of messages
        dispatch(setMessages(messageHistory));
      }
      dispatch(setLoadingMessages(false));
    };

    // Clear messages when changing chats
    dispatch(setMessages([]));

    if (socket && chat && chat.id) {
      // Join the chat room

      console.log("Join emitted");
      socket.emit("join", chat.id);
      fetchMessageHistory();

      // Set up socket event listeners
      const handleReceiveMessage = (data: MessageResponse) => {
        console.log("Received message:", data);
        const newMsg: Message = {
          id: data._id || `temp-${Date.now()}`,
          text: data.content,
          timestamp: new Date(
            data.timestamp ? data.timestamp * 1000 : Date.now()
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isUser: data.senderId === userId,
        };
        dispatch(addMessage(newMsg));
      };

      const handleTypingEvent = (data: TypingResponse) => {
        if (data.chatId === chat.id && data.senderId !== userId) {
          dispatch(setIsTyping(true));
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            dispatch(setIsTyping(false));
          }, 2000);
        }
      };

      // Add event listeners
      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("typing", handleTypingEvent);

      // Clean up function
      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("typing", handleTypingEvent);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        // Leave the room when component unmounts or chat changes
        socket.emit("leave", chat.id);
      };
    }
  }, [socket, chat, userId, dispatch]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket && chat && chat.id) {
      // Create message data
      const messageData = {
        senderId: userId,
        content: newMessage,
        entityId: chat.id,
        media: null,
        entity: "chat",
        isBot: false,
      };

      // Add message to local state immediately for better UX
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isUser: true,
      };
      dispatch(addMessage(tempMessage));

      // Send message through socket
      socket.emit(
        "sendMessage",
        messageData,
        (response: SendMessageResponse) => {
          console.log("Message sent response:", response);
          // If there's an error, we could handle it here
        }
      );

      // Clear input
      setNewMessage("");
    }
  };

  const handleTyping = () => {
    if (socket && chat && chat.id) {
      socket.emit("typing", { chatId: chat.id, senderId: userId });
    }
  };

  const handleClose = () => {
    dispatch(setActiveChat(null));
  };

  if (!chat) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>No chat selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-auto">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>{chat.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{chat.name}</h3>
            <p className="text-xs text-muted-foreground">
              {chat.type === "dm" ? "online" : `${chat.type}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p>{message.text}</p>
                <span className="text-xs opacity-70 block text-right mt-1">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="bg-muted p-2 rounded-md text-sm">
              <span>typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-3 border-t border-border flex items-center gap-2 py-6">
        <Button variant="ghost" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type Your Message Here..."
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="bg-primary text-primary-foreground rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
