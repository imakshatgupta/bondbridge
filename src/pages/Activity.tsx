import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SuggestedCommunities from "@/components/activity/SuggestedCommunities";
import ChatList from "@/components/activity/ChatList";
import GroupList from "@/components/activity/GroupList";
import CommunityList from "@/components/activity/CommunityList";
import ChatInterface from "@/components/activity/ChatInterface";
import { Link } from "react-router-dom";
import { useApiCall } from "@/apis/globalCatchError";
import { fetchChatRooms } from "@/apis/commonApiCalls/activityApi";
import {
  ChatItem,
  setActiveChat,
  setLoading,
  transformAndSetChats,
} from "@/store/chatSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export default function Activity() {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const { activeChat, filteredChats, isLoading } = useAppSelector(
    (state) => state.chat
  );
  const [executeFetchChats] = useApiCall(fetchChatRooms);

  useEffect(() => {
    const loadChats = async () => {
      dispatch(setLoading(true));
      const result = await executeFetchChats();
      if (result.success && result.data) {
        const currentUserId = localStorage.getItem("userId") || "";
        dispatch(
          transformAndSetChats({
            chatRooms: result.data.chatRooms,
            currentUserId,
          })
        );
      }
      dispatch(setLoading(false));
    };
    loadChats();
  }, [dispatch]);

  const handleSelectChat = (chat: ChatItem) => {
    dispatch(setActiveChat(chat));
  };

  return (
    <div className="flex h-screen">
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
            <Button className="cursor-pointer rounded-full">Add +</Button>
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
