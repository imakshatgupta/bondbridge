import { Heart, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import ThreeDotsMenu from "@/components/global/ThreeDotsMenu";
import { useState } from "react";

export interface PostProps {
    user: string;
    avatar: string;
    caption: string;
    image: string;
    likes: number;
    comments: number;
    datePosted: string;
    isOwner?: boolean;
    onCommentClick?: () => void;
    onLikeClick?: () => void;
}

export function Post({ user, avatar, caption, image, likes: initialLikes, comments, datePosted, isOwner = false, onCommentClick, onLikeClick }: PostProps) {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);

    const handleLikeClick = () => {
        if (!isLiked) {
            setLikes(prev => prev + 1);
            setIsLiked(true);
            onLikeClick?.();
        } else {
            setLikes(prev => prev - 1);
            setIsLiked(false);
            onLikeClick?.();
        }
    };

    return (
        <Card className="rounded-none border-x-0 border-t-0 shadow-none mb-4">
            <div className="flex items-center justify-between p-4">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${user}`)}
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
                {image && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                        <img
                            src={image}
                            alt="Post"
                            className="w-full max-h-[500px] object-contain bg-muted"
                        />
                    </div>
                )}
                <div className="flex items-center justify-between mt-4 text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <button 
                            className={`flex items-center gap-1 ${isLiked ? 'text-destructive' : 'hover:text-destructive'}`}
                            onClick={handleLikeClick}
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