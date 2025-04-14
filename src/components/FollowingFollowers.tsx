import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchFollowingList, fetchFollowersList, unfollowUser, removeFollower } from "@/apis/commonApiCalls/profileApi";
import { FollowingFollowerUser } from "@/apis/apiTypes/profileTypes";
import { useApiCall } from "@/apis/globalCatchError";
import { Loader2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { TruncatedText } from "@/components/ui/TruncatedText";

const FollowingFollowers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "following";
  
  const [following, setFollowing] = useState<FollowingFollowerUser[]>([]);
  const [followers, setFollowers] = useState<FollowingFollowerUser[]>([]);
  const [unfollowingUserId, setUnfollowingUserId] = useState<string | null>(null);
  const [removingFollowerId, setRemovingFollowerId] = useState<string | null>(null);
  
  const [executeFetchFollowing, isLoadingFollowing] = useApiCall(fetchFollowingList);
  const [executeFetchFollowers, isLoadingFollowers] = useApiCall(fetchFollowersList);
  const [executeUnfollow] = useApiCall(unfollowUser);
  const [executeRemoveFollower] = useApiCall(removeFollower);

  useEffect(() => {
    const loadData = async () => {
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
    };

    loadData();
  }, []);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleUnfollow = async (userId: string) => {
    setUnfollowingUserId(userId);
    const result = await executeUnfollow(userId);
    if (result.success) {
      // Remove the unfollowed user from the following list
      setFollowing(following.filter(user => user._id !== userId));
      toast.success("Successfully unfollowed user");
    }
    setUnfollowingUserId(null);
  };

  const handleRemoveFollower = async (userId: string) => {
    setRemovingFollowerId(userId);
    const result = await executeRemoveFollower(userId);
    if (result.success) {
      // Remove the user from the followers list
      setFollowers(followers.filter(user => user._id !== userId));
      toast.success("Successfully removed follower");
    }
    setRemovingFollowerId(null);
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
          No Users Found
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
                  <AvatarImage src={user.profilePic || user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/5 text-primary font-medium">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-foreground truncate">{user.name}</span>
                  <TruncatedText 
                    text={user.bio} 
                    limit={50}
                    className="text-sm text-muted-foreground" 
                    buttonClassName="text-primary text-xs ml-1 cursor-pointer hover:underline"
                    showToggle={false}
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnfollow(user._id);
                }}
                disabled={unfollowingUserId === user._id}
                className="min-w-[80px] justify-center cursor-pointer"
              >
                {unfollowingUserId === user._id ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Unfollowing</>
                ) : (
                  'Unfollow'
                )}
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
          No Users Found
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
                  <AvatarImage src={user.profilePic || user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/5 text-primary font-medium">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-foreground truncate">{user.name}</span>
                  <TruncatedText 
                    text={user.bio} 
                    limit={50}
                    className="text-sm text-muted-foreground" 
                    buttonClassName="text-primary text-xs ml-1 cursor-pointer hover:underline"
                    showToggle={false}
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFollower(user._id);
                }}
                disabled={removingFollowerId === user._id}
                className="min-w-[80px] justify-center cursor-pointer"
              >
                {removingFollowerId === user._id ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Removing</>
                ) : (
                  'Remove'
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-2xl mx-auto py-4 px-4">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="following" className="cursor-pointer">Following</TabsTrigger>
          <TabsTrigger value="followers" className="cursor-pointer">Followers</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="following" className="mt-0">
            <motion.div
              key="following"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FollowingList users={following} isLoading={isLoadingFollowing} />
            </motion.div>
          </TabsContent>

          <TabsContent value="followers" className="mt-0">
            <motion.div
              key="followers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <FollowersList users={followers} isLoading={isLoadingFollowers} />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default FollowingFollowers; 