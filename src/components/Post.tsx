import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import ThreeDotsMenu, {
    ReportMenuItem,
    DeleteMenuItem,
    EditPostMenuItem
} from "@/components/global/ThreeDotsMenu";
import { useState, useEffect, useRef } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useApiCall } from "@/apis/globalCatchError";
import {
    addReaction,
    deleteReaction,
    getAllReactions,
} from "@/apis/commonApiCalls/reactionApi";
import { deletePost } from "@/apis/commonApiCalls/createPostApi";
import { toast } from "sonner";
import { PostProps } from "@/types/post";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import SharePostPage from "./SharePostPage";

// Reaction types and their emojis
const REACTIONS = {
    like: { emoji: "👍🏻", label: "Like" },
    love: { emoji: "❤️", label: "Love" },
    haha: { emoji: "😂", label: "Haha" },
    lulu: { emoji: "😢", label: "Lulu" }
};

type ReactionType = keyof typeof REACTIONS;

export function Post({
    user,
    userId,
    avatar,
    caption,
    media = [],
    likes: initialLikes,
    comments,
    datePosted,
    isOwner = false,
    onCommentClick,
    onLikeClick,
    feedId,
    isLiked: initialIsLiked = false
}: PostProps) {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(null);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isLoadingReactions, setIsLoadingReactions] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [showReactionPopover, setShowReactionPopover] = useState(false);
    const reactionTimeoutRef = useRef<number | null>(null);
    const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
        like: 0,
        love: 0,
        haha: 0,
        lulu: 0
    });

    const [executeAddReaction] = useApiCall(addReaction);
    const [executeDeleteReaction] = useApiCall(deleteReaction);
    const [executeGetAllReactions] = useApiCall(getAllReactions);
    const [executeDeletePost] = useApiCall(deletePost);

    useEffect(() => {
        if (feedId) {
            fetchReactions();
        }
    }, [feedId]);

    useEffect(() => {
        // Cleanup timeout on unmount
        return () => {
            if (reactionTimeoutRef.current) {
                window.clearTimeout(reactionTimeoutRef.current);
            }
        };
    }, []);

    const fetchReactions = async () => {
        if (!feedId || isLoadingReactions) return;

        setIsLoadingReactions(true);
        const result = await executeGetAllReactions(feedId, 'feed');

        if (result.success && result.data) {
            // Find all reaction types from the response
            const currentUserId = localStorage.getItem('userId');
            let totalLikes = 0;
            let userReaction: ReactionType | null = null;

            // Initialize reaction counts
            const newReactionCounts: Record<ReactionType, number> = {
                like: 0,
                love: 0,
                haha: 0,
                lulu: 0
            };

            result.data.reactions.forEach(r => {
                // All reaction types contribute to the total "likes" count
                totalLikes += r.count;

                // Update individual reaction counts
                if (r.reactionType in newReactionCounts) {
                    newReactionCounts[r.reactionType as ReactionType] = r.count;
                }

                // Check if current user has any reaction
                const userHasReacted = r.users.some(u => u.userId === currentUserId);
                if (userHasReacted) {
                    setIsLiked(true);
                    userReaction = r.reactionType as ReactionType;
                }
            });

            setReactionCounts(newReactionCounts);
            setCurrentReaction(userReaction);
            setLikes(totalLikes);
        }
        setIsLoadingReactions(false);
    };

    const handleReactionSelect = async (reactionType: ReactionType) => {
        if (isLikeLoading || !feedId) return;

        const isSameReaction = currentReaction === reactionType;
        const wasLiked = isLiked;

        // Update UI optimistically
        setIsLiked(!isSameReaction);
        setCurrentReaction(isSameReaction ? null : reactionType);
        setLikes(prev => isSameReaction ? prev - 1 : (wasLiked ? prev : prev + 1));

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
                if (wasLiked && currentReaction) {
                    newCounts[currentReaction] = Math.max(0, newCounts[currentReaction] - 1);
                }
            }

            return newCounts;
        });

        setIsLikeLoading(true);
        setShowReactionPopover(false);

        const reactionData = {
            entityId: feedId,
            entityType: 'feed',
            reactionType
        };

        let result;
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

        if (!result.success || !result.data) {
            // Revert UI changes if API call fails
            setIsLiked(wasLiked);
            setCurrentReaction(wasLiked ? currentReaction : null);
            setLikes(prev => isSameReaction ? prev + 1 : (wasLiked ? prev : prev - 1));
        } else {
            onLikeClick?.();
        }

        setIsLikeLoading(false);
    };

    const handleLikeButtonClick = () => {
        // Simply show the reaction popover, don't auto-select or de-select reactions
        setShowReactionPopover(prev => !prev);

        // Clear auto-hide timeout if it exists
        if (reactionTimeoutRef.current) {
            window.clearTimeout(reactionTimeoutRef.current);
        }

        // Set a new auto-hide timeout
        reactionTimeoutRef.current = window.setTimeout(() => {
            setShowReactionPopover(false);
        }, 5000);
    };

    // Determine if we should show a carousel or a single image
    const hasMultipleMedia = media && media.length > 1;
    const hasSingleMedia = (media && media.length === 1);

    const handleDeletePost = async () => {
        if (!feedId) return;
        const result = await executeDeletePost(feedId);

        if (result.success) {
            toast.success("Post deleted successfully");
            if (window.location.pathname === `/post/${feedId}`) {
                navigate(-1);
            }
            else window.location.reload();
        }
    };

    const handleEditPost = () => {
        navigate(`/edit-post/${feedId}`, {
            state: {
                caption,
                postId: feedId,
                media
            }
        });
    };

    // Get the appropriate reaction emoji to display
    const displayedReaction = currentReaction ? REACTIONS[currentReaction].emoji : null;

    const menuItems = [
    ];

    if (isOwner) {
        menuItems.push(
            {
                ...EditPostMenuItem,
                onClick: handleEditPost
            },
            {
                ...DeleteMenuItem,
                onClick: handleDeletePost
            }
        );
    } else {
        menuItems.push({
            ...ReportMenuItem,
            onClick: () => console.log('Report clicked')
        });
    }

    return (
        <Card className="rounded-none border-x-0 border-t-0 shadow-none mb-4">
            <div className="flex items-center justify-between p-4">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${userId}`)}
                >
                    <Avatar>
                        <AvatarImage src={avatar} alt={user} />
                        <AvatarFallback>{user?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{user}</p>
                    </div>
                </div>
                <ThreeDotsMenu items={menuItems} />
            </div>
            <CardContent className="p-4 pt-0">
                <p className="text-card-foreground">{caption}</p>

                {hasMultipleMedia && media && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                        <Carousel className="w-full">
                            <CarouselContent>
                                {media.map((item, index) => (
                                    <CarouselItem key={`${userId}-media-${index}`}>
                                        {item.type === "image" && (
                                            <div className="aspect-square w-full relative bg-muted">
                                                <img
                                                    src={item.url}
                                                    alt={`Post media ${index + 1}`}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        {item.type === "video" && (
                                            <div className="aspect-square w-full relative bg-muted">
                                                <video
                                                    src={item.url}
                                                    controls
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2 bg-background/80" />
                            <CarouselNext className="right-2 bg-background/80" />
                        </Carousel>
                    </div>
                )}
                
                {!hasMultipleMedia && hasSingleMedia && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                        {media && media.length > 0 && media[0].type === "image" && (
                            <div className="aspect-square w-full relative bg-muted">
                                <img
                                    src={media[0].url}
                                    alt="Post"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {media && media.length > 0 && media[0].type === "video" && (
                            <div className="aspect-square w-full relative bg-muted">
                                <video
                                    src={media[0].url}
                                    controls
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mt-4 text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <Popover open={showReactionPopover} onOpenChange={setShowReactionPopover}>
                            <PopoverTrigger asChild>
                                <button
                                    className={`flex items-center gap-1 ${isLiked ? '' : 'hover:text-destructive'}`}
                                    onClick={handleLikeButtonClick}
                                    disabled={isLikeLoading || isLoadingReactions}
                                >
                                    {displayedReaction ? (
                                        <span className="text-lg">{displayedReaction}</span>
                                    ) : (
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    )}
                                    {likes}
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
                                            <button
                                                key={key}
                                                className={`flex items-center rounded-full py-1 px-2 transition-all hover:bg-accent ${currentReaction === key ? 'bg-accent' : ''
                                                    }`}
                                                onClick={() => {
                                                    if (currentReaction === key) {
                                                        // Remove reaction only if clicking the same one
                                                        handleReactionSelect(reactionType);
                                                    } else {
                                                        // Add new reaction
                                                        handleReactionSelect(reactionType);
                                                    }
                                                }}
                                                aria-label={label}
                                                title={label}
                                            >
                                                <span className="text-xl rounded-full w-8 h-8 flex items-center justify-center">{emoji}</span>
                                                <span className="text-sm font-medium">{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <button
                            className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            onClick={onCommentClick}
                        >
                            <MessageCircle className="w-5 h-5" /> {comments}
                        </button>
                        <button
                            className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            onClick={() => setIsShareDialogOpen(true)}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-sm text-muted-foreground">{datePosted}</div>
                </div>
            </CardContent>

            {feedId && (
                <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                    <DialogContent className="sm:max-w-md h-[80vh]">
                        <SharePostPage
                            postData={{
                                _id: feedId,
                                author: userId,
                                data: {
                                    content: caption,
                                    media: media && media.length > 0
                                        ? media
                                        : []
                                },
                                feedId: feedId,
                                name: user
                            }}
                            onClose={() => setIsShareDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    );
}