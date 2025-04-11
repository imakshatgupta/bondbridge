import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Search, ArrowLeft, Loader2 } from "lucide-react";
import { Person } from "@/apis/commonApiCalls/searchApi";
import { useApiCall } from "@/apis/globalCatchError";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { fetchFollowings } from "@/apis/commonApiCalls/activityApi";
import { Checkbox } from "@/components/ui/checkbox";
import { SharedPostData } from "@/apis/commonApiCalls/chatApi";
import { startMessage } from "@/apis/commonApiCalls/chatApi";
import { useSocket } from "@/context/SocketContext";

interface SharePostPageProps {
  postData: SharedPostData; // Use the defined shared post data type
  onClose: () => void;
}

interface ChatParticipant {
  userId: string;
  name: string;
  profilePic: string;
  status?: string;
}

const SharePostPage: React.FC<SharePostPageProps> = ({ postData, onClose }) => {
  const [users, setUsers] = useState<Person[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [executeFetchFollowings] = useApiCall(fetchFollowings);
  const [executeStartMessage] = useApiCall(startMessage);
  
  // Use socket context
  const { socket, isConnected } = useSocket();

  // Fetch following users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const result = await executeFetchFollowings();
      if (result.success && result.data?.users) {
        const currentUserId = localStorage.getItem("userId") || "";
        const filteredFollowings = result.data.users.filter(
          (user) => user.id !== currentUserId
        );
        setUsers(filteredFollowings);
        setFilteredUsers(filteredFollowings);
        console.log("filteredFollowings", filteredFollowings);
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, []);
  console.log("users", users);
  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleShareSelected = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one user to share with");
      return;
    }
    
    if (!socket) {
      toast.error("Socket connection not available");
      return;
    }
    
    if (!isConnected) {
      toast.error("Not connected to the chat server");
      return;
    }
    
    setIsSharing(true);
    setErrorMessage(null);
    
    try {
      const userId = localStorage.getItem("userId") || "";
      console.log("Starting share process for post:", postData._id);
      
      // Process each selected user
      const results = await Promise.allSettled(
        Array.from(selectedUsers).map(async (receiverId) => {
          console.log(`Sharing post with user ID: ${receiverId}`);
          
          // First, start or get the conversation with this user
          const startChatResult = await executeStartMessage({ userId2: receiverId });
          
          if (startChatResult.success && startChatResult.data) {
            const chatId = startChatResult.data.chatRoom.chatRoomId;
            console.log(`Chat room ID: ${chatId}`);
            
            const currentUserParticipant = startChatResult.data.chatRoom.participants.find(
              (p: ChatParticipant) => p.userId === userId
            );
            
            const userName = currentUserParticipant?.name || "You";
            const userAvatar = currentUserParticipant?.profilePic || "";
            
            // Create message data with the shared post content
            const messageData = {
              senderId: userId,
              content: JSON.stringify(postData),
              entityId: chatId,
              media: null,
              entity: "chat",
              isBot: false,
              senderName: userName,
              senderAvatar: userAvatar,
            };
            
            console.log("Joining chat room:", chatId);
            socket.emit("join", chatId);
            
            // Wait a moment for join to complete
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log("Sending message with post data");
            // Send the message
            socket.emit("sendMessage", messageData);
            
            // Wait to ensure message is sent
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Leave the chat room
            console.log("Leaving chat room:", chatId);
            socket.emit("leave", chatId);
            
            return receiverId;
          }
          
          throw new Error(`Failed to start chat with user ${receiverId}`);
        })
      );
      
      console.log("Share results:", results);
      
      // Check for failures
      const failures = results.filter(r => r.status === 'rejected');
      const successCount = results.length - failures.length;
      
      if (failures.length > 0) {
        console.error("Some shares failed:", failures);
        if (successCount === 0) {
          // All failed
          throw new Error("Failed to share post with any selected users");
        } else {
          // Some failed
          toast.warning(`Successfully shared with ${successCount} of ${results.length} selected users`);
        }
      } else {
        // All succeeded
        const sharedUsers = filteredUsers.filter(user => selectedUsers.has(user.id));
        const userNames = sharedUsers.map(user => user.name).join(", ");
        toast.success(`Post shared with ${userNames}`);
      }
    } catch (error: unknown) {
      console.error("Error sharing post:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to share post";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return; // Don't close dialog on error
    } finally {
      setIsSharing(false);
    }
    
    // Only close if no errors
    if (!errorMessage) {
      onClose();
    }
  };

  const isSomeSelected = selectedUsers.size > 0;

  return (
    <div className="space-y-6 flex flex-col h-[75vh]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium cursor-pointer">
          <ArrowLeft
            className="h-4 w-4 mr-2 inline"
            onClick={onClose}
          />
          Share Post
        </h3>
      </div>

      {errorMessage && (
        <div className="bg-destructive/20 text-destructive p-2 rounded text-sm">
          Error: {errorMessage}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Users..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10 flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <>
          <div className="flex items-center justify-between py-2 px-3">
            {isSomeSelected && (
              <span className="text-sm text-muted-foreground font-medium">
                {selectedUsers.size} User{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="overflow-y-auto flex-1 pr-1 space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-accent cursor-pointer"
                onClick={() => toggleUserSelection(user.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                    className="cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profilePic || user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" className="cursor-pointer" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleShareSelected}
              disabled={!isSomeSelected || isSharing || !isConnected}
              className="cursor-pointer"
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 border border-dashed border-border rounded-md flex-1">
          <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            {searchQuery ? "No users found" : "Search for users to share with"}
          </p>
        </div>
      )}
    </div>
  );
};

export default SharePostPage; 