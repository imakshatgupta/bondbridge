import { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApiCall } from "@/apis/globalCatchError";
import { addReaction, deleteReaction, getAllReactions } from "@/apis/commonApiCalls/reactionApi";
import { GetAllReactionsResponse, ReactionUser } from "@/apis/apiTypes/response";

// Reaction types and their emojis
export const REACTIONS = {
  like: { emoji: "👍🏻", label: "Like" },
  love: { emoji: "❤️", label: "Love" },
  haha: { emoji: "😂", label: "Haha" },
  lulu: { emoji: "😢", label: "Lulu" }
};

export type ReactionType = keyof typeof REACTIONS;

interface ReactionComponentProps {
  entityId: string;
  entityType: 'feed' | 'comment';
  initialReaction?: {
    hasReacted: boolean;
    reactionType: string | null;
  };
  onReactionChange?: (hasReacted: boolean, reactionType: string | null) => void;
  showCount?: boolean;
  initialTotalCount?: number;
  iconSize?: "sm" | "md" | "lg";
  initialReactionCounts?: {
    like?: number;
    love?: number;
    haha?: number;
    lulu?: number;
    [key: string]: number | undefined;
  };
}

const ReactionComponent = ({
  entityId,
  entityType,
  initialReaction = { hasReacted: false, reactionType: null },
  onReactionChange,
  showCount = true,
  initialTotalCount = 0,
  iconSize = "md",
  initialReactionCounts
}: ReactionComponentProps) => {
  const [showReactionPopover, setShowReactionPopover] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(
    initialReaction.reactionType as ReactionType || null
  );
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>(
    initialReactionCounts ? {
      like: initialReactionCounts.like || 0,
      love: initialReactionCounts.love || 0,
      haha: initialReactionCounts.haha || 0,
      lulu: initialReactionCounts.lulu || 0
    } : {
      like: 0,
      love: 0,
      haha: 0,
      lulu: 0
    }
  );
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [reactionUsers, setReactionUsers] = useState<Record<ReactionType, ReactionUser[]>>({
    like: [],
    love: [],
    haha: [],
    lulu: []
  });
  const [showTooltip, setShowTooltip] = useState<ReactionType | null>(null);
  const reactionTimeoutRef = useRef<number | null>(null);
  const [executeAddReaction] = useApiCall(addReaction);
  const [executeDeleteReaction] = useApiCall(deleteReaction);
  const [executeGetAllReactions] = useApiCall(getAllReactions);
  const [isReactionsLoaded, setIsReactionsLoaded] = useState(!!initialReactionCounts);

  // Calculate icon size class
  const getIconSizeClass = () => {
    switch (iconSize) {
      case "sm": return "w-4 h-4";
      case "lg": return "w-6 h-6";
      default: return "w-5 h-5";
    }
  };

  // Fetch reactions data when popover opens
  const fetchReactionData = async () => {
    if (isReactionsLoaded || !entityId) return;

    try {
      const result = await executeGetAllReactions(entityId, entityType);
      if (result.success && result.data) {
        const responseData = result.data as GetAllReactionsResponse;
        
        // Initialize counts and users objects
        const counts: Record<ReactionType, number> = {
          like: 0,
          love: 0, 
          haha: 0,
          lulu: 0
        };
        
        const users: Record<ReactionType, ReactionUser[]> = {
          like: [],
          love: [],
          haha: [],
          lulu: []
        };
        
        // Process the reaction data
        let total = 0;
        responseData.reactions.forEach(reaction => {
          const type = reaction.reactionType as ReactionType;
          if (type in counts) {
            counts[type] = reaction.count;
            users[type] = reaction.users;
            total += reaction.count;
          }
        });
        
        setReactionCounts(counts);
        setReactionUsers(users);
        setTotalCount(total);
        setIsReactionsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  // Update current reaction when initialReaction changes
  useEffect(() => {
    setCurrentReaction(initialReaction.reactionType as ReactionType || null);
  }, [initialReaction]);

  // Update totalCount when initialTotalCount prop changes
  useEffect(() => {
    setTotalCount(initialTotalCount);
  }, [initialTotalCount]);

  // Update reactionCounts when initialReactionCounts changes
  useEffect(() => {
    if (initialReactionCounts) {
      setReactionCounts({
        like: initialReactionCounts.like || 0,
        love: initialReactionCounts.love || 0,
        haha: initialReactionCounts.haha || 0,
        lulu: initialReactionCounts.lulu || 0
      });
      // Set isReactionsLoaded to true since we already have the counts
      setIsReactionsLoaded(true);
    }
  }, [initialReactionCounts]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (reactionTimeoutRef.current) {
        window.clearTimeout(reactionTimeoutRef.current);
      }
    };
  }, []);

  // Handle reaction button click (show popover)
  const handleLikeButtonClick = () => {
    setShowReactionPopover(prev => !prev);
    
    // Fetch reaction data if not already loaded
    if (!isReactionsLoaded) {
      fetchReactionData();
    }

    // Clear existing timeout
    if (reactionTimeoutRef.current) {
      window.clearTimeout(reactionTimeoutRef.current);
    }

    // Set auto-hide timeout
    reactionTimeoutRef.current = window.setTimeout(() => {
      setShowReactionPopover(false);
    }, 5000);
  };

  // Handle selecting a reaction
  const handleReactionSelect = async (reactionType: ReactionType) => {
    if (isLikeLoading || !entityId) return;

    const isSameReaction = currentReaction === reactionType;
    const wasReacted = currentReaction !== null;

    // Update UI optimistically
    const newReactionType = isSameReaction ? null : reactionType;
    setCurrentReaction(newReactionType);

    // Calculate new total count for optimistic update
    const oldTotal = totalCount;
    let newTotal = oldTotal;
    
    if (isSameReaction) {
      // Removing reaction, decrease total
      newTotal = Math.max(0, oldTotal - 1);
    } else if (!wasReacted) {
      // Adding new reaction (not switching), increase total
      newTotal = oldTotal + 1;
    }
    // If switching reactions, total stays the same
    
    // Update total count optimistically
    setTotalCount(newTotal);

    // Update reaction counts optimistically
    setReactionCounts(prev => {
      const newCounts = { ...prev };

      if (isSameReaction) {
        // Removing reaction
        newCounts[reactionType] = Math.max(0, newCounts[reactionType] - 1);
      } else {
        // Adding new reaction
        newCounts[reactionType] += 1;
        
        // If switching from another reaction, decrease the previous one
        if (wasReacted && currentReaction) {
          newCounts[currentReaction] = Math.max(0, newCounts[currentReaction] - 1);
        }
      }

      return newCounts;
    });

    // Close reaction popover
    setShowReactionPopover(false);

    // Set loading state
    setIsLikeLoading(true);

    const reactionData = {
      entityId,
      entityType,
      reactionType
    };

    try {
      let result;
      if (isSameReaction) {
        // If clicking the same reaction, remove it
        result = await executeDeleteReaction(reactionData);
      } else {
        if (wasReacted && currentReaction) {
          // First remove the previous reaction
          await executeDeleteReaction({
            entityId,
            entityType,
            reactionType: currentReaction
          });
        }
        // Then add the new reaction
        result = await executeAddReaction(reactionData);
      }

      if (!result.success) {
        // Revert UI changes if API call fails
        setCurrentReaction(wasReacted ? currentReaction : null);
        
        // Also revert reaction counts
        setReactionCounts(prev => {
          const currentCounts = { ...prev };
          if (isSameReaction) {
            // We tried to remove, but failed, so add back
            currentCounts[reactionType] += 1;
          } else if (wasReacted && currentReaction) {
            // We tried to switch, but failed, so revert
            currentCounts[reactionType] -= 1;
            currentCounts[currentReaction] += 1;
          } else {
            // We tried to add, but failed, so remove
            currentCounts[reactionType] -= 1;
          }
          return currentCounts;
        });
        
        // Revert total count
        setTotalCount(oldTotal);
      } else {
        // Notify parent component about the change
        if (onReactionChange) {
          onReactionChange(!isSameReaction, isSameReaction ? null : reactionType);
        }
        
        // Reaction data is now stale, clear the flag to refetch on next popover open
        setIsReactionsLoaded(false);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      // Revert UI changes in case of error
      setCurrentReaction(wasReacted ? currentReaction : null);
      setTotalCount(oldTotal);
      
      // Revert reaction counts
      setReactionCounts(prev => {
        const currentCounts = { ...prev };
        if (isSameReaction) {
          currentCounts[reactionType] += 1;
        } else if (wasReacted && currentReaction) {
          currentCounts[reactionType] -= 1;
          currentCounts[currentReaction] += 1;
        } else {
          currentCounts[reactionType] -= 1;
        }
        return currentCounts;
      });
    } finally {
      // Clear loading state
      setIsLikeLoading(false);
    }
  };

  // Handle count click to show user tooltip
  const handleCountClick = (e: React.MouseEvent, reactionType: ReactionType) => {
    e.stopPropagation(); // Prevent triggering parent button's onClick
    
    // Toggle tooltip for this reaction type
    setShowTooltip(prev => prev === reactionType ? null : reactionType);
  };

  // Get the appropriate reaction emoji to display
  const displayedReaction = currentReaction ? REACTIONS[currentReaction].emoji : null;

  return (
    <Popover open={showReactionPopover} onOpenChange={(open) => {
      setShowReactionPopover(open);
      if (open && !isReactionsLoaded) {
        fetchReactionData();
      }
    }}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          onClick={handleLikeButtonClick}
          disabled={isLikeLoading}
        >
          {displayedReaction ? (
            <span className="text-lg">{displayedReaction}</span>
          ) : (
            <Heart className={`${getIconSizeClass()} ${currentReaction ? 'fill-current' : ''}`} />
          )}
          {showCount && <span className="text-sm">{totalCount}</span>}
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
            const count = reactionCounts[reactionType];
            
            return (
              <div key={key} className="relative">
                <button
                  className={`flex items-center cursor-pointer rounded-full py-1 px-2 transition-all hover:bg-accent ${currentReaction === key ? 'bg-accent' : ''}`}
                  onClick={() => handleReactionSelect(reactionType)}
                  aria-label={label}
                  title={label}
                >
                  <span className="text-xl rounded-full w-8 h-8 flex items-center justify-center">{emoji}</span>
                  <span 
                    className="text-sm font-medium cursor-pointer reaction-count" 
                    onClick={(e) => handleCountClick(e, reactionType)}
                  >
                    {count}
                  </span>
                </button>
                
                {showTooltip === reactionType && (
                  <div 
                    className="absolute z-50 top-full mt-2 bg-card border p-2 shadow-md rounded-md reaction-tooltip"
                    style={{ width: "max-content" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {reactionUsers[reactionType].length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {reactionUsers[reactionType].map((user) => (
                          <div key={user.userId} className="flex items-center gap-2">
                            <Link
                              to={`/profile/${user.userId}`}
                              className="flex items-center gap-2 hover:opacity-80"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img 
                                src={user.profilePic || "/avatar.png"} 
                                alt={user.name}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                              <span className="text-sm whitespace-normal">{user.name}</span>
                            </Link>
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
  );
};

export default ReactionComponent; 