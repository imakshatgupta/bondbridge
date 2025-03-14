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
import { Plus, Search, Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchPeople, Person } from "@/apis/commonApiCalls/searchApi";
import { fetchFollowings } from "@/apis/commonApiCalls/activityApi";
import { startMessage } from "@/apis/commonApiCalls/chatApi";
import { ChatRoom } from "@/apis/apiTypes/response";

export default function Activity() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [followings, setFollowings] = useState<Person[]>([]);
  const dispatch = useAppDispatch();
  const { filteredChats, isLoading } = useAppSelector((state) => state.chat);
  const [executeFetchChats] = useApiCall(fetchChatRooms);
  const [executeStartMessage] = useApiCall(startMessage);
  const [executeSearch, isSearching] = useApiCall(searchPeople);
  const [executeFetchFollowings, isLoadingFollowings] =
    useApiCall(fetchFollowings);

  useEffect(() => {
    const loadChats = async () => {
      dispatch(setLoading(true));
      const result = await executeFetchChats();
      if (result.success && result.data) {
        const currentUserId = localStorage.getItem("userId") || "";
        dispatch(
          transformAndSetChats({
            chatRooms: result.data.chatRooms || [],
            currentUserId,
          })
        );
      }
      dispatch(setLoading(false));
    };
    loadChats();
  }, [dispatch]);

  useEffect(() => {
    const loadFollowings = async () => {
      const result = await executeFetchFollowings();
      if (result.success && result.data?.users) {
        const currentUserId = localStorage.getItem("userId") || "";
        const filteredFollowings = result.data.users.filter(
          (user) => user.id !== currentUserId
        );
        setFollowings(filteredFollowings);
      }
    };
    loadFollowings();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!dialogSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      const result = await executeSearch(dialogSearchQuery);
      if (result.success && result.data?.users) {
        const currentUserId = localStorage.getItem("userId") || "";
        const filteredResults = result.data.users.filter(
          (user) => user.id !== currentUserId
        );
        setSearchResults(filteredResults);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [dialogSearchQuery]);

  const handleSelectChat = (chat: ChatItem) => {
    dispatch(setActiveChat(chat));
  };

  const handleStartConversation = async (userId: string) => {
    try {
      const result = await executeStartMessage({ userId2: userId });
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
                  newChat.participants.find((p) => p.userId !== currentUserId)
                    ?.name || "Chat",
                avatar:
                  newChat.participants.find((p) => p.userId !== currentUserId)
                    ?.profilePic || "",
                lastMessage: "No messages yet",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                unread: false,
                type: "dm",
                participants: newChat.participants.map((p) => ({
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

  const displayUsers = dialogSearchQuery.trim() ? searchResults : followings;

  return (
    <div className="flex">
      {/* Main content area */}
      <div className={`p-6 overflow-y-auto border-r border-border`}>
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer rounded-full">
                  <Plus className="h-4 w-4 -mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a Conversation</DialogTitle>
                  <DialogDescription>
                    Search for a user to start a conversation with.
                  </DialogDescription>
                </DialogHeader>

                <div className="relative mt-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={dialogSearchQuery}
                    onChange={(e) => setDialogSearchQuery(e.target.value)}
                  />
                </div>

                <div className="max-h-60 overflow-y-auto mt-2">
                  {isSearching || isLoadingFollowings ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : displayUsers.length > 0 ? (
                    displayUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => handleStartConversation(user.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{user.name}</span>
                            {user.bio && (
                              <p className="text-xs text-muted-foreground">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartConversation(user.id);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      {dialogSearchQuery
                        ? "No users found"
                        : "Type to search for users"}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg text-muted-foreground mb-4">
            Suggested Communities
          </h2>
          <SuggestedCommunities />
        </div>

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

        {/* Chat Interface or Tabs */}
        <Tabs defaultValue="chats" className="w-full">
          <TabsList className="bg-transparent gap-4 *:px-5 *:py-1.5 mb-4">
            <TabsTrigger
              value="chats"
              className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground"
            >
              Chats ({filteredChats.dms.length})
            </TabsTrigger>
            <TabsTrigger
              value="my-groups"
              className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground"
            >
              My groups ({filteredChats.groups.length})
            </TabsTrigger>
            <TabsTrigger
              value="communities"
              className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground"
            >
              Communities ({filteredChats.communities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats">
            <ChatList
              chats={filteredChats.dms}
              isLoading={isLoading}
              onSelectChat={handleSelectChat}
            />
          </TabsContent>

          <TabsContent value="my-groups">
            <GroupList
              groups={filteredChats.groups}
              isLoading={isLoading}
              onSelectGroup={handleSelectChat}
            />
          </TabsContent>

          <TabsContent value="communities">
            <CommunityList
              communities={filteredChats.communities}
              isLoading={isLoading}
              onSelectCommunity={handleSelectChat}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
