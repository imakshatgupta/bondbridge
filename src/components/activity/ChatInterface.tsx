import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Chat } from '../chat/Chat';
import { Message } from '@/types/chat';
import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { useAppSelector } from "../../store";

interface Message {
  id: number;
  text: string;
  timestamp: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  chatId: number;
  name: string;
  avatar: string;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, name, avatar, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { userId } = useAppSelector(state => state.createProfile);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessageHistory = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from local storage
        const response = await axios.post("http://localhost:3000/api/get-all-messages", {
          roomId: chatId,
          page: 1,
          limit: 50
        }, {
          headers: {
            'userid': userId,
            'token': token,
          }
        });
        const messageHistory = response.data.messages.map((msg: any) => ({
          id: msg._id,
          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: msg.senderId === userId,
        })).reverse(); // Reverse the order of messages
        setMessages(messageHistory);
      } catch (error) {
        console.error("Failed to fetch message history", error);
      }
    };

    if (socket) {
      socket.emit("join", chatId);
      fetchMessageHistory();

      socket.on("receiveMessage", (data) => {
        const newMsg: Message = {
          id: data._id,
          text: data.content,
          timestamp: new Date(data.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: data.senderId === userId,
        };
        setMessages((prevMessages) => [...prevMessages, newMsg]);
      });

      socket.on("typing", (data) => {
        if (data.chatId === chatId && data.senderId !== userId) {
          setIsTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      });

      return () => {
        socket.off("receiveMessage");
        socket.off("typing");
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [socket, chatId, userId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        senderId: userId,
        content: newMessage,
        entityId: chatId,
        media: null,
        entity: "chat",
        isBot: false,
      };

      socket?.emit("sendMessage", messageData);

      // Do not update the local state here, wait for the server to send back the message
      setNewMessage("");
    }
  };

  const handleTyping = () => {
    socket?.emit("typing", { chatId, senderId: userId });
  };

  return (
    <Chat
      messages={messages}
      onSendMessage={handleSendMessage}
      avatar={avatar}
      username={name}
      onClose={onClose}
      showAvatar={false}
    />
  );
};

export default ChatInterface;