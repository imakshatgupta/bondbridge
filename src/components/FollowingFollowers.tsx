import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchFollowingList, fetchFollowersList } from "@/apis/commonApiCalls/profileApi";
import { FollowingFollowerUser } from "@/apis/apiTypes/profileTypes";
import { useApiCall } from "@/apis/globalCatchError";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const FollowingFollowers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "following";
  
  const [following, setFollowing] = useState<FollowingFollowerUser[]>([]);
  const [followers, setFollowers] = useState<FollowingFollowerUser[]>([]);
  
  const [executeFetchFollowing, isLoadingFollowing] = useApiCall(fetchFollowingList);
  const [executeFetchFollowers, isLoadingFollowers] = useApiCall(fetchFollowersList);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [followingResult, followersResult] = await Promise.all([
          executeFetchFollowing(),
          executeFetchFollowers()
        ]);

        if (followingResult.success && followingResult.data) {
          setFollowing(followingResult.data.data || []);
        }
        if (followersResult.success && followersResult.data) {
          setFollowers(followersResult.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadData();
  }, []);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleUnfollow = (userId: string) => {
    // This is a dummy function for the unfollow button
    console.log(`Unfollowed user: ${userId}`);
    // In a real implementation, you would call an API and update the state
  };

  const handleRemoveFollower = (userId: string) => {
    // This is a dummy function for the remove button
    console.log(`Removed follower: ${userId}`);
    // In a real implementation, you would call an API and update the state
  };

  const FollowingList = ({ users, isLoading }: { users: FollowingFollowerUser[], isLoading: boolean }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!Array.isArray(users) || users.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No users found
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {users.map((user) => (
          <Card
            key={user._id}
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              "border border-border/50 hover:border-border"
            )}
          >
            <div className="flex items-center p-4">
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer" 
                onClick={() => handleUserClick(user._id)}
              >
                <Avatar className="h-12 w-12 border-2 border-border/50">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/5 text-primary font-medium">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-foreground truncate">{user.name}</span>
                  <span className="text-sm text-muted-foreground truncate">{user.nickName}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnfollow(user._id);
                }}
              >
                Unfollow
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const FollowersList = ({ users, isLoading }: { users: FollowingFollowerUser[], isLoading: boolean }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!Array.isArray(users) || users.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No users found
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {users.map((user) => (
          <Card
            key={user._id}
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              "border border-border/50 hover:border-border"
            )}
          >
            <div className="flex items-center p-4">
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer" 
                onClick={() => handleUserClick(user._id)}
              >
                <Avatar className="h-12 w-12 border-2 border-border/50">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/5 text-primary font-medium">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-foreground truncate">{user.name}</span>
                  <span className="text-sm text-muted-foreground truncate">{user.nickName}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFollower(user._id);
                }}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-2xl mx-auto py-4 px-4">
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="mt-0">
          <FollowingList users={following} isLoading={isLoadingFollowing} />
        </TabsContent>

        <TabsContent value="followers" className="mt-0">
          <FollowersList users={followers} isLoading={isLoadingFollowers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowingFollowers; 