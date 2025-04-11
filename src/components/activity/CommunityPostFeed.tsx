import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchCommunities } from "@/apis/commonApiCalls/communitiesApi";
import { useApiCall } from "@/apis/globalCatchError";
import { CommunityResponse } from "@/apis/apiTypes/response";
import { ProfilePostData } from "@/apis/apiTypes/response";
import { ChatItem } from "@/store/chatSlice";
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface CommunityPostFeedProps {
  activeCommunityChatItem: ChatItem | null;
  onBack?: () => void;
}

const CommunityPostFeed: React.FC<CommunityPostFeedProps> = ({
  activeCommunityChatItem,
  onBack,
}) => {
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [posts, setPosts] = useState<ProfilePostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executeFetchCommunities] = useApiCall(fetchCommunities);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommunity = async () => {
      if (!activeCommunityChatItem) return;

      setLoading(true);
      try {
        const result = await executeFetchCommunities();
        if (result.success && result.data) {
          const foundCommunity = result.data.find(
            (c) => c._id === activeCommunityChatItem.id
          );

          if (foundCommunity) {
            setCommunity(foundCommunity);

            // Generate posts from the community data
            if (foundCommunity.posts && foundCommunity.posts.length > 0) {
              const realPostCount =
                foundCommunity.postCount || foundCommunity.posts.length;
              const communityPosts: ProfilePostData[] = Array(realPostCount)
                .fill(null)
                .map((_, index) => ({
                  id: foundCommunity.posts?.[index] || `post-${index}`,
                  userId: foundCommunity._id,
                  author: {
                    name: foundCommunity.name,
                    profilePic: foundCommunity.profilePicture || "",
                  },
                  content: `Community post ${index + 1}`,
                  createdAt: Date.now() - index * 3600000, // Decreasing timestamps
                  media:
                    index % 2 === 0
                      ? [
                          {
                            url: foundCommunity.backgroundImage || "",
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
                    id: foundCommunity._id,
                    name: foundCommunity.name,
                    members: foundCommunity.memberCount,
                    pfp: foundCommunity.profilePicture || "",
                    description: foundCommunity.description,
                    backgroundImage: foundCommunity.backgroundImage,
                    bio: foundCommunity.bio,
                  },
                }));
              setPosts(communityPosts);
            } else {
              setPosts([]);
            }
          } else {
            setError("Community not found");
          }
        } else {
          setError("Failed to load community data");
        }
      } catch (err) {
        console.error("Error loading community:", err);
        setError("An error occurred while loading community data");
      } finally {
        setLoading(false);
      }
    };

    loadCommunity();
  }, [activeCommunityChatItem]);

  // Format date display
  const formatPostDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNavigateToCommunityProfile = () => {
    if (community) {
      navigate(`/community/${community._id}`);
    }
  };

  if (!activeCommunityChatItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Select a community to view posts</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading community posts...</p>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Error: {error || "Community not found"}</p>
        <Button onClick={onBack} variant="ghost" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Community Header */}
      <div className="p-4 border-b flex items-center justify-between bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="mr-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar
            className="h-10 w-10 cursor-pointer"
            onClick={handleNavigateToCommunityProfile}
          >
            <AvatarImage
              src={community.profilePicture || "/placeholder.png"}
              alt={community.name}
            />
            <AvatarFallback>{community.name[0]}</AvatarFallback>
          </Avatar>
          <div
            className="cursor-pointer"
            onClick={handleNavigateToCommunityProfile}
          >
            <h3 className="font-semibold group-hover:text-primary group-hover:underline flex items-center">
              {community.name}
              <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-70" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {community.memberCount} Members
            </p>
          </div>
        </div>
      </div>

      {/* Post Feed */}
      <div className="flex-1 overflow-y-auto max-h-[79vh] pb-6">
        <div className="p-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p>No posts in this community yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg overflow-hidden border bg-background"
                >
                  {/* Post Header */}
                  <div className="p-3 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={post.author.profilePic}
                        alt={post.author.name}
                      />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">
                        {post.author.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatPostDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-3 pb-2">
                    <p className="text-sm mb-3">{post.content}</p>

                    {post.media.length > 0 && (
                      <div className="rounded-md overflow-hidden mb-3">
                        <img
                          src={post.media[0].url}
                          alt="Post"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    {/* Post Stats - simplified, no interaction */}
                    {/* <div className="flex items-center text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {post.stats.reactionCount} likes
                      </Badge>
                      <span className="mx-2">•</span>
                      <Badge variant="secondary" className="text-xs">
                        {post.stats.commentCount} comments
                      </Badge>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPostFeed;
