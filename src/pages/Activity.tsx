import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import SuggestedCommunities from "@/components/activity/SuggestedCommunities";
import ChatList from "@/components/activity/ChatList";
import GroupList from "@/components/activity/GroupList";
import CommunityList from "@/components/activity/CommunityList";
import { Link } from "react-router-dom";
import { useApiCall } from "@/apis/globalCatchError";
import { fetchChatRooms } from "@/apis/commonApiCalls/activityApi";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  ChatItem,
  setActiveChat,
  setLoading,
  transformAndSetChats,
} from "@/store/chatSlice";
import { Plus, UserPlus, MessageSquare, Users, Building2 } from "lucide-react";
import { startMessage } from "@/apis/commonApiCalls/chatApi";
import { ChatRoom } from "@/apis/apiTypes/response";
import UserSearchDialog from "@/components/common/UserSearchDialog";
import { SuggestedCommunitiesSkeleton, ChatListSkeleton } from "@/components/skeletons/ActivitySkeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Person } from "@/apis/apiTypes/response";

interface Participant {
  userId: string;
  name: string;
  profilePic: string;
}

export default function Activity() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { filteredChats, isLoading } = useAppSelector((state) => state.chat);
  const [executeFetchChats] = useApiCall(fetchChatRooms);
  const [executeStartMessage] = useApiCall(startMessage);

  useEffect(() => {
    const loadChats = async () => {
      dispatch(setLoading(true));
      try {
        const result = await executeFetchChats();
        if (result.success && result.data) {
          const currentUserId = localStorage.getItem("userId") || "";
          dispatch(
            transformAndSetChats({
              chatRooms: result.data.chatRooms || [],
              currentUserId,
            })
          );
          setError(null);
        } else {
          setError(result.data?.message || "Failed to load chats");
        }
      } catch (err) {
        console.log("err: ", err);
        setError("An error occurred while loading chats");
      } finally {
        dispatch(setLoading(false));
      }
    };
    loadChats();
  }, [dispatch]);

  const handleSelectChat = (chat: ChatItem) => {
    dispatch(setActiveChat(chat));
  };

  const handleStartConversation = async (user: Person) => {
    try {
      const result = await executeStartMessage({ userId2: user.id });
      if (result.success && result.data) {
        // Close the dialog
        setDialogOpen(false);

        // Refresh the chat list to include the new conversation
        const refreshResult = await executeFetchChats();
        if (refreshResult.success && refreshResult.data) {
          const currentUserId = localStorage.getItem("userId") || "";
          dispatch(
            transformAndSetChats({
              chatRooms: refreshResult.data.chatRooms || [],
              currentUserId,
            })
          );

          // Find the newly created chat and set it as active
          const newChatRoomId = result.data.chatRoom?.chatRoomId;
          if (newChatRoomId && refreshResult.data.chatRooms) {
            const newChat = refreshResult.data.chatRooms.find(
              (chat: ChatRoom) => chat.chatRoomId === newChatRoomId
            );

            if (newChat) {
              // Create a ChatItem directly from the API response
              const chatItem: ChatItem = {
                id: newChatRoomId,
                name:
                  newChat.participants.find(
                    (p: Participant) => p.userId !== currentUserId
                  )?.name || "Chat",
                avatar:
                  newChat.participants.find(
                    (p: Participant) => p.userId !== currentUserId
                  )?.profilePic || "",
                lastMessage: "No messages yet",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                unread: false,
                type: "dm",
                participants: newChat.participants.map((p: Participant) => ({
                  userId: p.userId,
                  name: p.name,
                  profilePic: p.profilePic,
                })),
              };

              dispatch(setActiveChat(chatItem));
            }
          }
        }
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // Filter chats based on search query
  const filteredDms = searchQuery 
    ? filteredChats.dms.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredChats.dms;
    
  const filteredGroups = searchQuery
    ? filteredChats.groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredChats.groups;
    
  const filteredCommunities = searchQuery
    ? filteredChats.communities.filter(community => 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredChats.communities;

  return (
    <div className="flex">
      {/* Main content area */}
      <div className={`p-6 overflow-y-auto w-full`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Activity</h1>
          <div className="flex gap-2">
            <Link to="/create-group">
              <Button
                variant="outline"
                className="cursor-pointer rounded-full bg-background text-primary border-primary"
              >
                Create Group
              </Button>
            </Link>
            <UserSearchDialog
              isOpen={dialogOpen}
              onOpenChange={setDialogOpen}
              onSelectUser={handleStartConversation}
              triggerButton={
                <Button className="cursor-pointer rounded-full">
                  <Plus className="h-4 w-4 -mr-1" />
                  Add
                </Button>
              }
              title="Start a Conversation"
              description="Search for a user to start a conversation with."
              actionIcon={<UserPlus className="h-4 w-4" />}
            />
          </div>
        </div>
        
        {/* Suggested Communities Section */}
        <div className="mb-8">
          <h2 className="text-lg text-muted-foreground mb-4">
            Suggested Communities
          </h2>
          {isLoading ? (
            <SuggestedCommunitiesSkeleton />
          ) : (
            <SuggestedCommunities />
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Input
            type="search"
            placeholder="search"
            className="w-full bg-muted border-none rounded-full pl-4 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Error State */}
        {error && !isLoading && (
          <EmptyState
            title="Failed to load activity"
            description={error}
            className="my-8"
          />
        )}

        {/* Chat Interface or Tabs */}
        {!error && (
          <Tabs defaultValue="chats" className="w-full">
            <TabsList className="bg-transparent gap-4 *:px-5 *:py-1.5 mb-4">
              <TabsTrigger
                value="chats"
                className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground cursor-pointer"
              >
                Chats ({filteredChats.dms.length})
              </TabsTrigger>
              <TabsTrigger
                value="my-groups"
                className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground cursor-pointer"
              >
                My groups ({filteredChats.groups.length})
              </TabsTrigger>
              <TabsTrigger
                value="communities"
                className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground cursor-pointer"
              >
                Communities ({filteredChats.communities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chats">
              {isLoading ? (
                <ChatListSkeleton />
              ) : filteredDms.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No chats yet"
                  description={searchQuery ? `No chats matching "${searchQuery}"` : "Start a conversation to chat with friends"}
                  actionLabel={searchQuery ? undefined : "Start Chat"}
                  actionIcon={searchQuery ? undefined : UserPlus}
                  onAction={searchQuery ? undefined : () => setDialogOpen(true)}
                  className="my-8"
                />
              ) : (
                <ChatList
                  chats={filteredDms}
                  isLoading={isLoading}
                  onSelectChat={handleSelectChat}
                />
              )}
            </TabsContent>

            <TabsContent value="my-groups">
              {isLoading ? (
                <ChatListSkeleton />
              ) : filteredGroups.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No groups yet"
                  description={searchQuery ? `No groups matching "${searchQuery}"` : "Create or join a group to chat with multiple people"}
                  actionLabel={searchQuery ? undefined : "Create Group"}
                  className="my-8"
                />
              ) : (
                <GroupList
                  groups={filteredGroups}
                  isLoading={isLoading}
                  onSelectGroup={handleSelectChat}
                />
              )}
            </TabsContent>

            <TabsContent value="communities">
              {isLoading ? (
                <ChatListSkeleton />
              ) : filteredCommunities.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No communities yet"
                  description={searchQuery ? `No communities matching "${searchQuery}"` : "Join a community to connect with people who share your interests"}
                  className="my-8"
                />
              ) : (
                <CommunityList
                  communities={filteredCommunities}
                  isLoading={isLoading}
                  onSelectCommunity={handleSelectChat}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
