import { Heart, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import ThreeDotsMenu from "@/components/global/ThreeDotsMenu";
import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { PostProps } from "@/types/post";

export function Post({ 
    user, 
    userId, 
    avatar, 
    caption, 
    image, 
    media, 
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
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isLoadingReactions, setIsLoadingReactions] = useState(false);

    const [executeAddReaction] = useApiCall(addReaction);
    const [executeDeleteReaction] = useApiCall(deleteReaction);
    const [executeGetAllReactions] = useApiCall(getAllReactions);

    useEffect(() => {
        if (feedId) {
            fetchReactions();
        }
    }, [feedId]);

    const fetchReactions = async () => {
        if (!feedId || isLoadingReactions) return;
        
        setIsLoadingReactions(true);
        try {
            const result = await executeGetAllReactions(feedId, 'feed');
            
            if (result.success && result.data) {
                const likeReaction = result.data.reactions.find(r => r.reactionType === 'like');
                
                if (likeReaction) {
                    // Get current user ID from localStorage or auth context
                    const currentUserId = localStorage.getItem('userId'); // Adjust based on your auth implementation
                    
                    // Check if current user has liked the post
                    const userHasLiked = likeReaction.users.some(u => u.userId === currentUserId);
                    setIsLiked(userHasLiked);
                    
                    // Update likes count
                    setLikes(likeReaction.count);
                }
            }
        } catch (error) {
            console.error('Failed to fetch reactions:', error);
        } finally {
            setIsLoadingReactions(false);
        }
    };

    const handleLikeClick = async () => {
        if (isLikeLoading || !feedId) return;

        setIsLikeLoading(true);
        try {
            const reactionData = {
                entityId: feedId,
                entityType: 'feed',
                reactionType: 'like'
            };

            let result;
            if (isLiked) {
                result = await executeDeleteReaction(reactionData);
            } else {
                result = await executeAddReaction(reactionData);
            }

            if (result.success && result.data) {
                setIsLiked(!isLiked);
                setLikes(prev => isLiked ? prev - 1 : prev + 1);
                onLikeClick?.();
            } else {
                toast.error("Failed to update like status");
            }
        } catch (error) {
            toast.error("Failed to update like status");
        } finally {
            setIsLikeLoading(false);
        }
    };

    // Determine if we should show a carousel or a single image
    const hasMultipleMedia = media && media.length > 1;
    const hasSingleMedia = (media && media.length === 1) || image;

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
                <ThreeDotsMenu
                    showDelete={isOwner}
                    onShare={() => console.log('Share clicked')}
                    onReport={() => console.log('Report clicked')}
                    onDelete={() => console.log('Delete clicked')}
                />
            </div>
            <CardContent className="p-4 pt-0">
                <p className="text-card-foreground">{caption}</p>
                
                {/* Carousel for multiple media items */}
                {hasMultipleMedia && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                        <Carousel className="w-full">
                            <CarouselContent>
                                {media!.map((item, index) => (
                                    <CarouselItem key={`${userId}-media-${index}`}>
                                        {item.type === "image" && (
                                            <img
                                                src={item.url}
                                                alt={`Post media ${index + 1}`}
                                                className="w-full max-h-[500px] object-contain bg-muted"
                                            />
                                        )}
                                        {item.type === "video" && (
                                            <video
                                                src={item.url}
                                                controls
                                                className="w-full max-h-[500px] object-contain bg-muted"
                                            />
                                        )}
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2 bg-background/80" />
                            <CarouselNext className="right-2 bg-background/80" />
                        </Carousel>
                    </div>
                )}
                
                {/* Single media item (backward compatibility) */}
                {!hasMultipleMedia && hasSingleMedia && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                        <img
                            src={media ? media[0].url : image}
                            alt="Post"
                            className="w-full max-h-[500px] object-contain bg-muted"
                        />
                    </div>
                )}
                
                <div className="flex items-center justify-between mt-4 text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <button 
                            className={`flex items-center gap-1 ${isLiked ? 'text-destructive' : 'hover:text-destructive'} ${isLikeLoading || isLoadingReactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleLikeClick}
                            disabled={isLikeLoading || isLoadingReactions}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} /> {likes}
                        </button>
                        <button
                            className="flex items-center gap-1 hover:text-primary"
                            onClick={onCommentClick}
                        >
                            <MessageCircle className="w-5 h-5" /> {comments}
                        </button>
                    </div>
                    <div className="text-sm text-muted-foreground">{datePosted}</div>
                </div>
            </CardContent>
        </Card>
    );
}