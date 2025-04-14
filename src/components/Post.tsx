import { MessageCircle, Share2, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import ThreeDotsMenu, {
    ReportMenuItem,
    DeleteMenuItem,
    EditPostMenuItem
} from "@/components/global/ThreeDotsMenu";
import { useState, useEffect } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useApiCall } from "@/apis/globalCatchError";
import { deletePost } from "@/apis/commonApiCalls/createPostApi";
import { toast } from "sonner";
import { PostProps } from "@/types/post";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import SharePostPage from "./SharePostPage";
import { ReportModal } from './ReportModal';
import ReactionComponent from "./global/ReactionComponent";
import VideoObserver from "./common/VideoObserver";

// Reaction types and their emojis
// const REACTIONS = {
//     like: { emoji: "👍🏻", label: "Like" },
//     love: { emoji: "❤️", label: "Love" },
//     haha: { emoji: "😂", label: "Haha" },
//     lulu: { emoji: "😢", label: "Lulu" }
// };

// type ReactionType = keyof typeof REACTIONS;

export function Post({
    user,
    userId,
    avatar,
    caption,
    media = [],
    comments,
    datePosted,
    isOwner = false,
    onCommentClick,
    onLikeClick,
    feedId,
    onDelete,
    initialReaction = { hasReacted: false, reactionType: null },
    initialReactionCount = 0,
    initialReactionDetails = { total: 0, types: { like: 0, love: 0, haha: 0, lulu: 0 } }
}: PostProps) {
    const navigate = useNavigate();
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    // const [showReactionPopover, setShowReactionPopover] = useState(false);
    // const reactionTimeoutRef = useRef<number | null>(null);
    // const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    //     like: reactionDetails.types.like || 0,
    //     love: reactionDetails.types.love || 0,
    //     haha: reactionDetails.types.haha || 0,
    //     lulu: reactionDetails.types.lulu || 0
    // });
    const [isMuted, setIsMuted] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const videoRefs = useRef<Record<number, HTMLVideoElement>>({});
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const currentUserId = localStorage.getItem('userId') || '';
    
    // Use state to track reactions but initialize from props
    const [reactionCount, setReactionCount] = useState(initialReactionCount);
    const [reactionDetails, setReactionDetails] = useState(initialReactionDetails);
    const [reaction, setReaction] = useState(initialReaction);

    // Update state if props change
    useEffect(() => {
        setReactionCount(initialReactionCount);
        setReactionDetails(initialReactionDetails);
        setReaction(initialReaction);
    }, [initialReactionCount, initialReactionDetails, initialReaction]);

    const handleReportClick = () => {
        setIsReportModalOpen(true);
    };

    const [executeDeletePost] = useApiCall(deletePost);

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
            else if (onDelete) {
                onDelete(feedId);
            }
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

    // Handle reaction changes
    const handleReactionChange = (hasReacted: boolean, reactionType: string | null) => {
        // Update local state optimistically for better UI experience
        setReaction({
            hasReacted,
            reactionType
        });
        
        // Update reaction count optimistically
        // If adding a reaction and previously had none
        if (hasReacted && !reaction.hasReacted) {
            setReactionCount((prev: number) => prev + 1);
        } 
        // If removing a reaction
        else if (!hasReacted && reaction.hasReacted) {
            setReactionCount((prev: number) => Math.max(0, prev - 1));
        }
        // If changing reaction type, count stays the same
        
        // Notify parent component about the change (if needed)
        if (onLikeClick) {
            onLikeClick();
        }
    };

    const menuItems = [];

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
            onClick: handleReportClick
        });
    }

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(prev => !prev);
        
        // Update all video elements for this post
        Object.values(videoRefs.current).forEach(videoEl => {
            if (videoEl) {
                videoEl.muted = !isMuted;
            }
        });
    };

    return (
        <>
            <Card className="rounded-none border-x-0 border-t-0 shadow-none mb-4" data-post-id={feedId}>
                {/* Video observer component to handle autoplay/pause based on visibility */}
                {feedId && <VideoObserver feedId={feedId} media={media} />}
                
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
                                                <div className="max-h-[100vh] relative bg-background flex items-center justify-center">
                                                    <img
                                                        src={item.url}
                                                        alt={`Post media ${index + 1}`}
                                                        className="max-h-[100vh] w-full object-contain"
                                                    />
                                                </div>
                                            )}
                                            {item.type === "video" && (
                                                <div 
                                                    className="max-h-[100vh] relative bg-background flex items-center justify-center"
                                                    onMouseEnter={() => setShowControls(true)}
                                                    onMouseLeave={() => setShowControls(false)}
                                                >
                                                    <video
                                                        ref={el => {
                                                            if (el) videoRefs.current[index] = el;
                                                        }}
                                                        src={item.url}
                                                        className="max-h-[100vh] w-full object-contain"
                                                        autoPlay
                                                        loop
                                                        muted={isMuted}
                                                        playsInline
                                                    />
                                                    <button 
                                                        className={`absolute bottom-4 right-4 p-2 bg-background/70 rounded-full hover:bg-background transition-colors cursor-pointer ${showControls ? 'opacity-100' : 'opacity-0'}`}
                                                        onClick={toggleMute}
                                                    >
                                                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                                    </button>
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
                                <div className="max-h-[100vh] relative bg-background flex items-center justify-center">
                                    <img
                                        src={media[0].url}
                                        alt="Post"
                                        className="max-h-[100vh] w-full object-contain"
                                    />
                                </div>
                            )}
                            {media && media.length > 0 && media[0].type === "video" && (
                                <div 
                                    className="max-h-[100vh] relative bg-background flex items-center justify-center"
                                    onMouseEnter={() => setShowControls(true)}
                                    onMouseLeave={() => setShowControls(false)}
                                >
                                    <video
                                        ref={el => {
                                            if (el) videoRefs.current[0] = el;
                                        }}
                                        src={media[0].url}
                                        className="max-h-[100vh] w-full object-contain"
                                        autoPlay
                                        loop
                                        muted={isMuted}
                                        playsInline
                                    />
                                    <button 
                                        className={`absolute bottom-4 right-4 p-2 bg-background/70 rounded-full hover:bg-background transition-colors cursor-pointer ${showControls ? 'opacity-100' : 'opacity-0'}`}
                                        onClick={toggleMute}
                                    >
                                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4 text-muted-foreground">
                        <div className="flex items-center gap-3">
                            {feedId && (
                                <ReactionComponent 
                                    entityId={feedId}
                                    entityType="feed"
                                    initialReaction={reaction}
                                    initialTotalCount={reactionCount}
                                    initialReactionCounts={reactionDetails.types}
                                    onReactionChange={handleReactionChange}
                                />
                            )}

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
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                postId={feedId}
                reporterId={currentUserId}
            />
        </>
    );
}