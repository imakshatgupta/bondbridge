import React, { useRef, useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import {
  Message,
  addMessage,
  setIsTyping,
  setLoadingMessages,
  setMessages,
} from "@/store/chatSlice";
import { useApiCall } from "@/apis/globalCatchError";
import { getMessages, getRandomText } from "@/apis/commonApiCalls/chatApi";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  blockUser as blockUserApi,
  leaveGroup as leaveGroupApi,
  inviteToGroup as inviteToGroupApi
} from "@/apis/commonApiCalls/activityApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EditGroupModal } from "../EditGroupModal";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchFollowersList } from "@/apis/commonApiCalls/profileApi";
import { SimpleFollower } from "./InviteFollowers";

// Components
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import GroupProfile from "./GroupProfile";
import InviteFollowers from "./InviteFollowers";

// Import menu items
import {
  BlockMenuItem,
  ReportMenuItem,
  EditGroupMenuItem
} from "@/components/global/ThreeDotsMenu";

// Define types for socket responses
interface MessageResponse {
  _id?: string;
  content: string;
  senderId: string;
  timestamp?: number;
  chatId?: string;
  senderName?: string;
  senderAvatar?: string;
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

interface ChatInterfaceProps {
  chatId: string;
  name: string;
  avatar: string;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatId,
  name,
  avatar,
  onClose,
}) => {
  // State
  const [newMessage, setNewMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [showGroupProfile, setShowGroupProfile] = useState(false);
  const [showInviteView, setShowInviteView] = useState(false);
  const [followers, setFollowers] = useState<SimpleFollower[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<SimpleFollower[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  
  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { socket } = useSocket();
  const userId = localStorage.getItem("userId") || "";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    messages,
    isLoadingMessages,
    isTyping,
    activeChat: chat,
  } = useAppSelector((state) => state.chat);
  
  // API calls
  const [executeGetMessages] = useApiCall(getMessages);
  const [executeGetRandomText] = useApiCall(getRandomText);
  const [executeBlockUser] = useApiCall(blockUserApi);
  const [executeLeaveGroup] = useApiCall(leaveGroupApi);
  const [executeFetchFollowers] = useApiCall(fetchFollowersList);
  const [executeInviteToGroup] = useApiCall(inviteToGroupApi);

  // Find other user's ID in DM chat
  const otherUserId =
    chat?.type === "dm"
      ? chat.participants.find((p) => p.userId !== userId)?.userId
      : undefined;

  // Find current user's info from participants
  const currentUserInfo = chat?.participants.find((p) => p.userId === userId);
  const userName = currentUserInfo?.name || "You";
  const userAvatar = currentUserInfo?.profilePic || "";

  // Find if the current user has left the group
  const currentUserParticipant = chat?.participants.find(p => p.userId === userId);
  const hasLeftGroup = currentUserParticipant?.status === "left";

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "end",
//     });
//   };

// useEffect(() => {
//     scrollToBottom();
//   }, [messages]);
  // Combined useEffect for fetching messages and suggestions
  useEffect(() => {
    const fetchMessageHistory = async () => {
      if (!chatId) {
        console.error("Invalid chat ID:", chatId);
        return;
      }

      dispatch(setLoadingMessages(true));
      dispatch(setMessages([]));

      const result = await executeGetMessages({
        roomId: chatId,
        page: 1,
        limit: 50,
      });

      if (result.success && result.data) {
        const messageHistory = result.data.messages
          .map((msg) => {
            // Find sender info from participants
            const sender = chat?.participants.find(
              (p) => p.userId === msg.senderId
            );
            return {
              id: msg._id,
              text: msg.content,
              timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              senderId: msg.senderId,
              isUser: msg.senderId === userId,
              senderName:
                msg.senderId === userId ? userName : sender?.name || "Unknown",
              senderAvatar:
                msg.senderId === userId ? userAvatar : sender?.profilePic || "",
            };
          })
          .reverse(); // Reverse the order of messages
        dispatch(setMessages(messageHistory));

        // If no messages were found, fetch suggestions
        if (messageHistory.length === 0 && chat ) {
          await fetchSuggestions();
        } else {
          // Clear suggestions if there are messages
          setSuggestions([]);
        }
      }

      dispatch(setLoadingMessages(false));
    };

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      
      // For groups where otherUserId might not exist, find the first participant who isn't the current user
      let targetUserId = otherUserId;
      
      if (!targetUserId && chat?.participants && chat.participants.length > 0) {
        // Find the first non-current user participant
        const firstOtherParticipant = chat.participants.find(p => p.userId !== userId);
        if (firstOtherParticipant) {
          targetUserId = firstOtherParticipant.userId;
        }
      }
      
      // If we still don't have a target user ID, use a fallback or empty string
      targetUserId = targetUserId || "";
      
      const result = await executeGetRandomText(targetUserId);
      if (result.success && result.data?.topic) {
        // Parse the topic string into individual suggestions
        const suggestionText = result.data.topic;
        const parsedSuggestions = suggestionText
          .split("\n")
          .map((line: string) => {
            // Extract the text between quotes
            const match = line.match(/"([^"]+)"/);
            return match ? match[1] : "";
          })
          .filter(Boolean);

        setSuggestions(parsedSuggestions);
      }
      setLoadingSuggestions(false);
    };

    if (socket && chatId) {
      // Join the chat room
      socket.emit("join", chatId);
      fetchMessageHistory();

      // Set up socket event listeners
      const handleReceiveMessage = (data: MessageResponse) => {
        // Clear suggestions when receiving a message
        setSuggestions([]);

        // Find sender info from participants
        if (data.senderId === userId) {
          return;
        }
        const sender = chat?.participants.find(
          (p) => p.userId === data.senderId
        );

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
          senderName:
            data.senderId === userId
              ? userName
              : sender?.name || data.senderName || "Unknown",
          senderAvatar:
            data.senderId === userId
              ? userAvatar
              : sender?.profilePic || data.senderAvatar || "",
        };
        dispatch(addMessage(newMsg));
      };

      const handleTypingEvent = (data: TypingResponse) => {
        if (data.chatId === chatId && data.senderId !== userId) {
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
        socket.emit("leave", chatId);
      };
    }
  }, [socket, chatId, userId, chat]);

  // Handlers
  const handleSendMessage = () => {
    if (newMessage.trim() && socket && chatId) {
      // Create message data
      const messageData = {
        senderId: userId,
        content: newMessage,
        entityId: chatId,
        media: null,
        entity: "chat",
        isBot: false,
        senderName: userName,
        senderAvatar: userAvatar,
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
        senderName: userName,
        senderAvatar: userAvatar,
      };
      dispatch(addMessage(tempMessage));

      // Send message through socket
      socket.emit(
        "sendMessage",
        messageData,
        (response: SendMessageResponse) => {
          console.log("Message sent response:", response);
        }
      );

      // Clear input
      setNewMessage("");
    }
  };

  const handleTyping = () => {
    if (socket && chatId) {
      socket.emit("typing", { chatId: chatId, senderId: userId });
    }
  };

  const handleProfileClick = () => {
    if (chat?.type === "dm") {
      // Navigate to the other user's profile
      const otherParticipant = chat.participants.find(
        (p) => p.userId !== userId
      );
      if (otherParticipant) {
        navigate(`/profile/${otherParticipant.userId}`);
      }
    } else if (chat?.type === "group") {
      // Toggle group profile view
      setShowGroupProfile(true);
    }
  };

  const handleBlock = async () => {
    if (chat?.type === "dm") {
      const otherParticipant = chat.participants.find(p => p.userId !== userId);
      if (otherParticipant) {
        await executeBlockUser(otherParticipant.userId);
        toast.success(`${otherParticipant.name} has been blocked`);
        onClose();
      }
    }
  };

  const handleEditGroup = () => {
    setIsEditGroupModalOpen(true);
  };

  const handleGroupUpdated = () => {
    // Refresh chat data or update local state as needed
    // This will be called after successful group update
  };

  const handleLeaveGroup = async () => {
    if (!chat || chat.type !== "group") return;
    const result = await executeLeaveGroup(chatId);

    if (result.success) {
      toast.success("Left the group successfully");
      onClose(); // Close the chat window
    }
  };

  // Inviting followers functions
  const fetchInvitableFollowers = async () => {
    if (!chat) return;

    setIsLoadingFollowers(true);

    // Call API
    const response = await executeFetchFollowers();

    if (response.success && response.data) {
      // Get participant IDs for filtering
      const groupParticipantIds = chat.participants.map(p => p.userId);

      // Extract and process followers
      const invitableFollowers: SimpleFollower[] = [];

      // Process followers array
      const followersList = response.data.data || [];
      
      for (let i = 0; i < followersList.length; i++) {
        const follower = followersList[i];

        // Skip if already in the group
        if (groupParticipantIds.includes(follower._id)) continue;

        // Add to invitable list
        invitableFollowers.push({
          _id: follower._id,
          name: follower.name,
          avatar: follower.avatar || follower.profilePic || "",
          selected: false
        });
      }

      setFollowers(invitableFollowers);
      setFilteredFollowers(invitableFollowers);

      // Show toast if no followers to invite
      if (invitableFollowers.length === 0) {
        toast.info("You don't have any followers to add to this group");
      }
    } else {
      toast.error("Failed to load followers");
    }

    setIsLoadingFollowers(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredFollowers(followers);
    } else {
      const filtered = followers.filter(follower =>
        follower.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredFollowers(filtered);
    }
  };

  const toggleFollowerSelection = (followerId: string) => {
    setFollowers(prevFollowers =>
      prevFollowers.map(follower =>
        follower._id === followerId
          ? { ...follower, selected: !follower.selected }
          : follower
      )
    );

    setFilteredFollowers(prevFiltered =>
      prevFiltered.map(follower =>
        follower._id === followerId
          ? { ...follower, selected: !follower.selected }
          : follower
      )
    );

    setSelectedFollowers(prev =>
      prev.includes(followerId)
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    );
  };

  const inviteFollowersToGroup = async () => {
    if (selectedFollowers.length === 0 || !chat) return;

    setIsInviting(true);

    // Call the add API
    const result = await executeInviteToGroup(chat.id, selectedFollowers);

    if (result.success) {
      toast.success(`Added ${selectedFollowers.length} people to the group`);
      setShowInviteView(false);
      setSelectedFollowers([]);
      setFollowers([]);
      setFilteredFollowers([]);
    } else {
      toast.error(result.data?.message || "Failed to add users to the group");
    }

    setIsInviting(false);
  };

  const handleShowAddView = async () => {
    setShowInviteView(true);
    await fetchInvitableFollowers();
  };

  // Prepare menu items based on chat type
  const menuItems = [];

  if (chat?.type === "dm") {
    // For DM chats -> block
    menuItems.push({
      ...BlockMenuItem,
      onClick: handleBlock
    });
  } else if (chat?.type === "group") {
    // For group chats -> report, edit group (only for admin)
    menuItems.push({
      ...ReportMenuItem,
      onClick: () => console.log('Report clicked')
    });
    
    // Only add edit group option for the admin
    if (chat.admin === userId) {
      menuItems.push({
        ...EditGroupMenuItem,
        onClick: handleEditGroup
      });
    }
  }

  if (!chat) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  // Find the typing user
  const typingUser = isTyping
    ? chat.participants.find((p) => p.userId !== userId)
    : null;

  const showSuggestions =
    messages.length === 0 && !isLoadingMessages && suggestions.length > 0;

  // Render the InviteFollowers view
  if (showInviteView) {
    return (
      <InviteFollowers
        filteredFollowers={filteredFollowers}
        isLoadingFollowers={isLoadingFollowers}
        searchTerm={searchTerm}
        selectedFollowers={selectedFollowers}
        isInviting={isInviting}
        onSearchChange={handleSearchChange}
        onFollowerClick={toggleFollowerSelection}
        onInvite={inviteFollowersToGroup}
        onClose={() => {
          setShowInviteView(false);
          setSelectedFollowers([]);
          setSearchTerm("");
        }}
      />
    );
  }

  // Render the GroupProfile view
  if (showGroupProfile && chat.type === "group") {
    return (
      <GroupProfile
        name={chat.name}
        avatar={chat.avatar}
        bio={chat.bio}
        participants={chat.participants}
        admin={chat.admin || ""}
        currentUserId={userId}
        hasLeftGroup={hasLeftGroup}
        onBack={() => setShowGroupProfile(false)}
        onLeaveGroup={handleLeaveGroup}
        onAddMembers={handleShowAddView}
      />
    );
  }

  // Render the main chat interface
  return (
    <div className="h-full flex flex-col bg-background border-l">
      <ChatHeader
        name={name}
        avatar={avatar}
        chatType={chat.type}
        participantsCount={chat.participants.filter(p => p.status === "active").length}
        onClose={onClose}
        onProfileClick={handleProfileClick}
        menuItems={menuItems}
      />

      {/* Add a wrapper div with flex-1 and overflow handling */}
      <div className="flex-1 overflow-hidden relative">
        <MessageList
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          isTyping={isTyping}
          typingUser={typingUser || null}
          chatType={chat.type}
          userId={userId}
        />
      </div>

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleTyping={handleTyping}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        loadingSuggestions={loadingSuggestions}
        disabled={hasLeftGroup}
        disabledMessage="You can't send messages to this group"
      />

      <EditGroupModal
        isOpen={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        groupName={name}
        bio={chat?.bio || ""}
        image={avatar}
        groupId={chatId}
        onGroupUpdated={handleGroupUpdated}
      />
    </div>
  );
};

export default ChatInterface; 