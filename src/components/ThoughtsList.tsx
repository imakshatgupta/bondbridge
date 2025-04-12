import { useNavigate } from "react-router-dom";
import { ProfilePostData } from "../apis/apiTypes/response";
import ThreeDotsMenu, { ReportMenuItem } from "./global/ThreeDotsMenu";
import { MessageCircle, Heart, Share2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SharePostPage from "./SharePostPage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApiCall } from "@/apis/globalCatchError";
import { addReaction, deleteReaction, getAllReactions } from "@/apis/commonApiCalls/reactionApi";
import { ReportModal } from './ReportModal';
import { GetAllReactionsResponse, Reaction, ReactionUser } from "@/apis/apiTypes/response";

// Reaction types and their emojis
const REACTIONS = {
  like: { emoji: "👍🏻", label: "Like" },
  love: { emoji: "❤️", label: "Love" },
  haha: { emoji: "😂", label: "Haha" },
  lulu: { emoji: "😢", label: "Lulu" }
};

type ReactionType = keyof typeof REACTIONS;

// Helper function to format time ago
const formatTimeAgo = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;

  if (secondsAgo < 60) return `${secondsAgo}s`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d`;
  if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 604800)}w`;
  return `${Math.floor(secondsAgo / 2592000)}mo`;
};

interface Post {
  id: number | string;
  media: Array<{
    url: string;
    type: string;
  }>;
  creationDate?: string;
  content?: string;
  author?: {
    name: string;
    profilePic: string;
  };
  stats?: {
    commentCount: number;
    hasReacted: boolean;
    reactionCount: number;
    reactionType: string | null;
  };
  reactionDetails?: {
    total: number;
    types: {
      [key: string]: number;
    };
  };
}

interface ThoughtsListProps {
  posts: (Post | ProfilePostData)[];
  userId: string;
}

const ThoughtsList: React.FC<ThoughtsListProps> = ({ posts, userId }) => {
  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = useState<Record<string, boolean>>({});
  const [showReactionPopover, setShowReactionPopover] = useState<Record<string, boolean>>({});
  const [isLikeLoading, setIsLikeLoading] = useState<Record<string, boolean>>({});
  const [currentReactions, setCurrentReactions] = useState<Record<string, ReactionType | null>>({});
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<ReactionType, number>>>({});
  const reactionTimeoutRefs = useRef<Record<string, number | null>>({});
  const [executeAddReaction] = useApiCall(addReaction);
  const [executeDeleteReaction] = useApiCall(deleteReaction);
  const [executeGetAllReactions] = useApiCall(getAllReactions);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('userId') || '';
  const [reactionUsersData, setReactionUsersData] = useState<Record<string, Reaction[]>>({});
  const [showTooltip, setShowTooltip] = useState<{postId: string, reactionType: ReactionType} | null>(null);
  
  // Add global click handler to close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTooltip) {
        const target = event.target as HTMLElement;
        // Check if the click is outside any tooltip or count span
        if (!target.closest('.reaction-tooltip') && !target.closest('.reaction-count')) {
          setShowTooltip(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTooltip]);
  
  // Filter posts with no media
  const thoughtPosts = posts.filter(post => {
    const isProfilePost = "createdAt" in post;
    
    const media = isProfilePost
      ? (post as ProfilePostData)?.media || []
      : (post as Post)?.media || [];
      
    return media.length === 0;
  });
  
  // Sort posts from recent to oldest
  const sortedThoughtPosts = [...thoughtPosts].sort((a, b) => {
    const timestampA = "createdAt" in a ? (a as ProfilePostData).createdAt : 0;
    const timestampB = "createdAt" in b ? (b as ProfilePostData).createdAt : 0;
    return timestampB - timestampA; // Descending order (newest first)
  });
  
  if (sortedThoughtPosts.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 text-muted-foreground">
        No Quotes
      </div>
    );
  }

  // Helper function to initialize reaction counts for a post
  const getInitialReactionCounts = (post: Post | ProfilePostData): Record<ReactionType, number> => {
    const isProfilePost = "createdAt" in post;
    const total = isProfilePost 
      ? (post as ProfilePostData).stats?.reactionCount || 0
      : (post as Post).stats?.reactionCount || 0;
    
    // Try to get detailed reaction counts if available
    if ("reactionDetails" in post && post.reactionDetails) {
      return {
        like: post.reactionDetails.types.like || 0,
        love: post.reactionDetails.types.love || 0,
        haha: post.reactionDetails.types.haha || 0,
        lulu: post.reactionDetails.types.lulu || 0
      };
    }
    
    // Default: assign all reactions to 'like' if no details available
    return {
      like: total,
      love: 0,
      haha: 0,
      lulu: 0
    };
  };

  // Initialize reaction counts if not already set
  sortedThoughtPosts.forEach(post => {
    const postId = (post as Post | ProfilePostData).id?.toString() || "";
    if (postId && !reactionCounts[postId]) {
      reactionCounts[postId] = getInitialReactionCounts(post);
      
      // Also set current reaction if the post has one
      const isProfilePost = "createdAt" in post;
      const reactionType = isProfilePost
        ? (post as ProfilePostData).stats?.reactionType
        : (post as Post).stats?.reactionType;
        
      if (reactionType && reactionType in REACTIONS) {
        currentReactions[postId] = reactionType as ReactionType;
      }
    }
  });

  // Function to fetch reaction users data
  const fetchReactionUsers = async (feedId: string) => {
    if (reactionUsersData[feedId]) return; // Already fetched

    try {
      const result = await executeGetAllReactions(feedId, 'feed');
      if (result.success && result.data) {
        const responseData = result.data as GetAllReactionsResponse;
        setReactionUsersData(prev => ({
          ...prev,
          [feedId]: responseData.reactions
        }));
      }
    } catch (error) {
      console.error("Error fetching reactions users:", error);
    }
  };

  // Toggle tooltip visibility on count click
  const handleCountClick = (e: React.MouseEvent, postId: string, feedId: string, reactionType: ReactionType) => {
    e.stopPropagation(); // Prevent bubbling to parent elements
    
    if (!reactionUsersData[feedId]) {
      fetchReactionUsers(feedId);
    }
    
    // Toggle tooltip visibility
    setShowTooltip(prev => 
      prev?.postId === postId && prev?.reactionType === reactionType 
        ? null 
        : { postId, reactionType }
    );
  };

  // Reaction handling function
  const handleReactionSelect = async (postId: string, feedId: string, reactionType: ReactionType) => {
    if (isLikeLoading[postId]) return;

    const currentReaction = currentReactions[postId] || null;
    const isSameReaction = currentReaction === reactionType;
    const wasLiked = !!currentReaction;

    // Update UI optimistically
    setCurrentReactions(prev => ({
      ...prev,
      [postId]: isSameReaction ? null : reactionType
    }));

    // Update reaction counts optimistically
    setReactionCounts(prev => {
      const prevCounts = prev[postId] || { like: 0, love: 0, haha: 0, lulu: 0 };
      const newCounts = { ...prevCounts };

      if (isSameReaction) {
        // Removing reaction
        newCounts[reactionType] = Math.max(0, newCounts[reactionType] - 1);
      } else {
        // Adding new reaction
        newCounts[reactionType] += 1;

        // If switching from another reaction, decrease the previous one
        if (wasLiked && currentReaction) {
          newCounts[currentReaction] = Math.max(0, newCounts[currentReaction] - 1);
        }
      }

      return {
        ...prev,
        [postId]: newCounts
      };
    });

    // Close reaction popover
    setShowReactionPopover(prev => ({
      ...prev,
      [postId]: false
    }));

    // Set loading state
    setIsLikeLoading(prev => ({
      ...prev,
      [postId]: true
    }));

    const reactionData = {
      entityId: feedId,
      entityType: 'feed',
      reactionType
    };

    let result;
    try {
      if (isSameReaction) {
        // If clicking the same reaction, remove it
        result = await executeDeleteReaction(reactionData);
      } else {
        if (wasLiked && currentReaction) {
          // First remove the previous reaction
          await executeDeleteReaction({
            entityId: feedId,
            entityType: 'feed',
            reactionType: currentReaction
          });
        }
        // Then add the new reaction
        result = await executeAddReaction(reactionData);
      }

      if (!result.success) {
        // Revert UI changes if API call fails
        setCurrentReactions(prev => ({
          ...prev,
          [postId]: wasLiked ? currentReaction : null
        }));
        
        // Also revert reaction counts
        setReactionCounts(prev => {
          const currentCounts = { ...prev[postId] };
          if (isSameReaction) {
            // We tried to remove, but failed, so add back
            currentCounts[reactionType as ReactionType] += 1;
          } else if (wasLiked && currentReaction) {
            // We tried to switch, but failed, so revert
            currentCounts[reactionType as ReactionType] -= 1;
            currentCounts[currentReaction] += 1;
          } else {
            // We tried to add, but failed, so remove
            currentCounts[reactionType as ReactionType] -= 1;
          }
          return {
            ...prev,
            [postId]: currentCounts
          };
        });
      }

      // Clear reaction users data cache to fetch updated data
      setReactionUsersData(prev => {
        const newData = { ...prev };
        delete newData[feedId];
        return newData;
      });
    } catch (error) {
      console.error("Error handling reaction:", error);
    } finally {
      // Clear loading state
      setIsLikeLoading(prev => ({
        ...prev,
        [postId]: false
      }));
    }
  };

  // Handle like button click (show reaction popover)
  const handleLikeButtonClick = (postId: string, feedId: string) => {
    // Toggle popover state
    setShowReactionPopover(prev => {
      const newState = { ...prev };
      const isOpening = !newState[postId];
      newState[postId] = isOpening;
      
      // If we're opening the popover, fetch the reaction data
      if (isOpening && !reactionUsersData[feedId]) {
        fetchReactionUsers(feedId);
      }
      
      return newState;
    });

    // Clear existing timeout if any
    if (reactionTimeoutRefs.current[postId]) {
      window.clearTimeout(reactionTimeoutRefs.current[postId]);
    }

    // Set auto-hide timeout
    reactionTimeoutRefs.current[postId] = window.setTimeout(() => {
      setShowReactionPopover(prev => ({
        ...prev,
        [postId]: false
      }));
    }, 5000);
  };

  // Handle share button click
  const handleShareClick = (postId: string) => {
    setShareDialogOpen(prev => ({
      ...prev,
      [postId]: true
    }));
  };

  const handleReportClick = (feedId: string) => {
    setSelectedPostId(feedId);
    setIsReportModalOpen(true);
  };

  // Check if the current user is viewing their own profile
  const isOwnProfile = userId === currentUserId;

  // Function to get users who reacted with a specific reaction
  const getUsersWithReaction = (feedId: string, reactionType: ReactionType): ReactionUser[] => {
    const reactions = reactionUsersData[feedId];
    if (!reactions) return [];
    
    const reactionData = reactions.find(r => r.reactionType === reactionType);
    return reactionData?.users || [];
  };

  return (
    <div className="flex flex-col space-y-4">
      {sortedThoughtPosts.map((post) => {
        // Determine if it's a ProfilePostData or a regular Post
        const isProfilePost = "createdAt" in post;
        
        // Extract post properties based on type
        const postId = isProfilePost
          ? (post as ProfilePostData).id
          : (post as Post).id;
          
        const content = isProfilePost
          ? (post as ProfilePostData).content
          : (post as Post).content || "";
          
        const authorName = isProfilePost
          ? (post as ProfilePostData).author?.name
          : (post as Post).author?.name || "";
          
        const authorProfilePic = isProfilePost
          ? (post as ProfilePostData).author?.profilePic
          : (post as Post).author?.profilePic || "";
          
        const commentCount = isProfilePost
          ? (post as ProfilePostData).stats?.commentCount || 0
          : (post as Post).stats?.commentCount || 0;
          
        const reactionCount = isProfilePost
          ? (post as ProfilePostData).stats?.reactionCount || 0
          : (post as Post).stats?.reactionCount || 0;
          
        const timestamp = isProfilePost
          ? (post as ProfilePostData).createdAt
          : 0;
          
        const timeAgo = isProfilePost ? formatTimeAgo(timestamp) : "";
        
        // Create feedId for navigation
        let creationDate = "2025-03-16";

        if (isProfilePost) {
          creationDate = new Date((post as ProfilePostData)?.createdAt * 1000)
            .toISOString()
            .split("T")[0];
        } else if ("creationDate" in post && post?.creationDate) {
          creationDate = post?.creationDate;
        }

        const feedId = `${postId}:${creationDate}`;
        const postWithUserId = { ...post, userId };
        
        // Menu items for the three dots menu
        const menuItems = [
          {
            ...ReportMenuItem,
            onClick: () => handleReportClick(feedId)
          }
        ];

        // Get the appropriate reaction emoji to display
        const currentReaction = currentReactions[postId];
        const displayedReaction = currentReaction ? REACTIONS[currentReaction].emoji : null;
        const postIdStr = postId.toString();
        
        // Get reaction counts for this post
        const postReactionCounts = reactionCounts[postIdStr] || { like: 0, love: 0, haha: 0, lulu: 0 };

        return (
          <div key={postIdStr} className="border-b border-border pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src={authorProfilePic || "/avatar.png"}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-row gap-3 items-center">
                  <div className="font-semibold">{authorName}</div>
                  <div className="text-sm text-muted-foreground">{timeAgo}</div>
                </div>
              </div>
              {!isOwnProfile && <ThreeDotsMenu items={menuItems} />}
            </div>
            
            <div 
              className="my-4 cursor-pointer"
              onClick={() => navigate(`/post/${feedId}`, { state: { post: postWithUserId } })}
            >
              <p className="text-foreground">{content}</p>
              {content.length > 100 && (
                <span className="text-primary cursor-pointer">Read more</span>
              )}
            </div>
            
            <div className="flex items-center gap-6 mt-2">
              <button 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => navigate(`/post/${feedId}`, { state: { post: postWithUserId } })}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{commentCount}</span>
              </button>

              <Popover open={showReactionPopover[postIdStr]} onOpenChange={(open) => {
                setShowReactionPopover(prev => ({ ...prev, [postIdStr]: open }));
                if (open && !reactionUsersData[feedId]) {
                  fetchReactionUsers(feedId);
                }
              }}>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => handleLikeButtonClick(postIdStr, feedId)}
                    disabled={isLikeLoading[postIdStr]}
                  >
                    {displayedReaction ? (
                      <span className="text-lg">{displayedReaction}</span>
                    ) : (
                      <Heart className={`w-5 h-5 ${currentReaction ? 'fill-current' : ''}`} />
                    )}
                    <span className="text-sm">{reactionCount}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-2 bg-card rounded-full w-fit border shadow-md"
                  side="top"
                  align="start"
                  sideOffset={5}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center">
                    {Object.entries(REACTIONS).map(([key, { emoji, label }]) => {
                      const reactionType = key as ReactionType;
                      const count = postReactionCounts[reactionType];
                      
                      return (
                        <div key={key} className="relative">
                          <button
                            className={`flex items-center cursor-pointer rounded-full py-1 px-2 transition-all hover:bg-accent ${currentReaction === key ? 'bg-accent' : ''}`}
                            onClick={() => handleReactionSelect(postIdStr, feedId, reactionType)}
                            aria-label={label}
                            title={label}
                          >
                            <span className="text-xl rounded-full w-8 h-8 flex items-center justify-center">{emoji}</span>
                            <span 
                              className="text-sm font-medium cursor-pointer reaction-count" 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent button click
                                handleCountClick(e, postIdStr, feedId, reactionType);
                              }}
                            >
                              {count}
                            </span>
                          </button>
                          
                          {showTooltip?.postId === postIdStr && showTooltip?.reactionType === reactionType && (
                            <div 
                              className="absolute z-50 top-full mt-2 bg-card border p-2 shadow-md rounded-md reaction-tooltip"
                              style={{ width: "max-content" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Show users who reacted with this reaction */}
                              {getUsersWithReaction(feedId, reactionType).length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  {getUsersWithReaction(feedId, reactionType).map((user) => (
                                    <div key={user.userId} className="flex items-center gap-2">
                                      <img 
                                        src={user.profilePic || "/avatar.png"} 
                                        alt={user.name}
                                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                      />
                                      <span className="text-sm whitespace-normal">{user.name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm">No users</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <button 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => handleShareClick(postIdStr)}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen[postIdStr] || false} onOpenChange={(open) => {
              setShareDialogOpen(prev => ({
                ...prev,
                [postIdStr]: open
              }));
            }}>
              <DialogContent className="sm:max-w-md h-[80vh]">
                <SharePostPage
                  postData={{
                    _id: feedId,
                    author: userId,
                    data: {
                      content: content,
                      media: []
                    },
                    feedId: feedId,
                    name: authorName
                  }}
                  onClose={() => setShareDialogOpen(prev => ({
                    ...prev,
                    [postIdStr]: false
                  }))}
                />
              </DialogContent>
            </Dialog>
          </div>
        );
      })}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedPostId(null);
        }}
        postId={selectedPostId || ''}
        reporterId={currentUserId}
      />
    </div>
  );
};

export default ThoughtsList; 