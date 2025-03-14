import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SuggestedCommunities from '@/components/activity/SuggestedCommunities';
import ChatList from '@/components/activity/ChatList';
import GroupList from '@/components/activity/GroupList';
import CommunityList from '@/components/activity/CommunityList';
import { Link } from 'react-router-dom';


export default function Activity() {
  const [searchQuery, setSearchQuery] = useState('');




  return (
    <div className="max-w-2xl mx-auto space-y-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Activity</h1>
        <div className="flex gap-2">
          <Link to="/create-group">
            <Button variant="outline" className="cursor-pointer rounded-full bg-background text-primary border-primary">
              Create Group
            </Button>
          </Link>
          <Button className="cursor-pointer rounded-full">
            Add +
          </Button>
        </div>
      </div>

      {/* Suggested Communities */}

      <div className="">
        <h2 className="text-lg text-muted-foreground mb-4">Suggested Communities</h2>
        <SuggestedCommunities />
      </div>



      <div className="relative">
        <Input
          type="search"
          placeholder="search"
          className="w-full bg-muted border-none rounded-full pl-4 pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>


      {/* Chat Interface or Tabs */}

      <Tabs defaultValue="chats" className="w-full space-y-3">
        <TabsList className="bg-transparent gap-4 *:px-5 *:py-1.5">
          <TabsTrigger value="chats" className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground">
            Chats (5)
          </TabsTrigger>
          <TabsTrigger value="my-groups" className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground">
            My groups (2)
          </TabsTrigger>
          <TabsTrigger value="communities" className="data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground">
            Communities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats">
          <ChatList />
        </TabsContent>

        <TabsContent value="my-groups">
          <GroupList />
        </TabsContent>

        <TabsContent value="communities">
          <CommunityList />
        </TabsContent>
      </Tabs>
    </div>
  );
} 