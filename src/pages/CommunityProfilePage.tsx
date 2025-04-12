import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, MessageSquare } from "lucide-react";
import { useApiCall } from "@/apis/globalCatchError";
import {
  joinCommunity,
  fetchCommunityById,
} from "@/apis/commonApiCalls/communitiesApi";
import { CommunityResponse, CommunityPostDetail } from "@/apis/apiTypes/communitiesTypes";
import { Loader2 } from "lucide-react";
import AllPosts from "@/components/AllPosts";
import { toast } from "sonner";
import CommunityMemberList from "@/components/community/CommunityMemberList";

const CommunityProfilePage = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPostDetail[]>([]);
  const [isLoadingPosts] = useState(false);
  const [isUserMember, setIsUserMember] = useState(false);
  const [isMembershipLoading, setIsMembershipLoading] = useState(false);
  const [executeJoinCommunity] = useApiCall(joinCommunity);
  const [executeFetchCommunityById] = useApiCall(fetchCommunityById);

  useEffect(() => {
    const loadCommunity = async () => {
      if (!communityId) return;
      
      setLoading(true);
      try {
        const result = await executeFetchCommunityById(communityId);
        console.log("API Response:", result); // Debug log
        
        if (result.success && result.data) {
          const communityData = result.data;
          console.log("Community Data:", communityData); // Debug log
          setCommunity(communityData);

          // Check if current user is a member
          const userId = localStorage.getItem("userId");
          if (userId && communityData.members) {
            setIsUserMember(communityData.members.includes(userId));
          }

          // Process posts data
          if (communityData.posts && communityData.posts.length > 0) {
            const realPostCount = communityData.postCount || communityData.posts.length;
            const communityPosts: CommunityPostDetail[] = Array(realPostCount)
              .fill(null)
              .map((_, index) => ({
                id: communityData.posts?.[index] || `post-${index}`,
                userId: communityData._id,
                author: {
                  name: communityData.name,
                  profilePic: communityData.profilePicture || "",
                },
                content: `Community post ${index + 1}`,
                createdAt: Date.now() - index * 3600000, // Decreasing timestamps
                media: communityData.backgroundImage
                  ? [
                      {
                        url: communityData.backgroundImage,
                        type: "image",
                      },
                    ]
                  : [],
                reactionDetails: {
                  total: 0,
                  types: {
                    like: 0,
                    love: 0,
                    haha: 0,
                    lulu: 0,
                  },
                },
                stats: {
                  commentCount: Math.floor(Math.random() * 10),
                  hasReacted: false,
                  reactionCount: Math.floor(Math.random() * 20),
                  reactionType: null,
                },
                community: {
                  id: communityData._id,
                  name: communityData.name,
                  members: communityData.memberCount,
                  pfp: communityData.profilePicture || "",
                  description: communityData.description,
                  backgroundImage: communityData.backgroundImage,
                  bio: communityData.bio,
                },
              }));
            setPosts(communityPosts);
          } else {
            setPosts([]);
          }
        } else {
          console.error("API Error:", result); // Debug error
          setError("Failed to load Community Data");
        }
      } catch (err) {
        console.error("Exception in loadCommunity:", err);
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    loadCommunity();
  }, [communityId]);

  const handleJoinCommunity = async () => {
    if (!communityId) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Authentication required", {
        description: "Please login to join communities",
      });
      return;
    }

    setIsMembershipLoading(true);
    const result = await executeJoinCommunity({
      communityIds: [communityId],
      userId,
      action: "join",
    });

    if (result.success) {
      setIsUserMember(true);
      toast.success("Success", {
        description: "You have joined the community!",
      });
    } else {
      toast.error("Error", {
        description: "Failed to Join Community",
      });
    }
    setIsMembershipLoading(false);
  };

  const handleLeaveCommunity = async () => {
    if (!communityId) return;

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    setIsMembershipLoading(true);
    const result = await executeJoinCommunity({
      communityIds: [communityId],
      userId,
      action: "remove",
    });

    if (result.success) {
      setIsUserMember(false);
      toast.success("Success", {
        description: "You have left the community",
      });
    } else {
      toast.error("Error", {
        description: "Failed to Leave Community",
      });
    }
    setIsMembershipLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">
          {error || "Community not found"}
        </p>
        <Button
          variant="outline"
          className="mt-4 cursor-pointer"
          onClick={() => navigate("/activity")}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with background image */}
      <div className="relative">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={community.backgroundImage || "/placeholder-bg.jpg"}
            alt={`${community.name} background`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/60 backdrop-blur-sm rounded-full cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Community avatar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage
              src={community.profilePicture || "/placeholder.png"}
              alt={community.name}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl">
              {community.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Community information */}
      <div className="flex flex-col items-center mt-20 px-6">
        <h1 className="text-3xl font-bold text-center">{community.name}</h1>

        <div className="flex items-center gap-2 my-2">
          <Badge variant="secondary" className="px-2 py-0.5">
            <Users className="h-3 w-3 mr-1" />
            {community.memberCount.toLocaleString()} Members
          </Badge>
          <Badge variant="secondary" className="px-2 py-0.5">
            <MessageSquare className="h-3 w-3 mr-1" />
            {community.postCount || 0} Posts
          </Badge>
        </div>

        <p className="text-foreground text-center mt-2 max-w-md">
          {community.description || community.bio}
        </p>

        <div className="flex gap-3 mt-6">
          {isUserMember ? (
            <Button
              variant="outline"
              className="rounded-full text-foreground border-destructive cursor-pointer"
              onClick={handleLeaveCommunity}
              disabled={isMembershipLoading}
            >
              {isMembershipLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Leave
            </Button>
          ) : (
            <Button
              className="rounded-full cursor-pointer"
              onClick={handleJoinCommunity}
              disabled={isMembershipLoading}
            >
              {isMembershipLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Join
            </Button>
          )}
          {/* <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => {
              // Share functionality would go here
              navigator.clipboard.writeText(window.location.href);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      <div className="flex-1 mt-8">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/30 rounded-lg backdrop-blur-sm mb-4 *:rounded-md *:m-1 *:data-[state=active]:bg-accent *:data-[state=active]:text-foreground *:text-muted-foreground">
            <TabsTrigger value="about" className="cursor-pointer">About</TabsTrigger>
            <TabsTrigger value="posts" className="cursor-pointer">Posts</TabsTrigger>
            <TabsTrigger value="members" className="cursor-pointer">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="p-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{community.description}</p>

              <h3 className="font-semibold mt-4 mb-2">Interest</h3>
              <Badge className="bg-primary/20 text-foreground border-primary">
                {community.interest}
              </Badge>

              <h3 className="font-semibold mt-4 mb-2">Created</h3>
              <p className="text-muted-foreground">
                {new Date(community.createdAt).toLocaleDateString()}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="p-4">
            {isLoadingPosts ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (community.postCount && community.postCount > 0) ||
              (community.posts && community.posts.length > 0) ? (
                <AllPosts posts={posts} userId={community._id} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No posts in this community yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="p-4">
            {community?.memberDetails && community.memberDetails.length > 0 ? (
              <CommunityMemberList memberDetails={community.memberDetails} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No members in this community yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityProfilePage;
