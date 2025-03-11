import { MoreHorizontal, Heart, MessageCircle,  Share2, Flag, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export interface PostProps {
  user: string;
  avatar: string;
  postDate: string;
  caption: string;
  image: string;
  likes: number;
  comments: number;
  datePosted: string;
  onCommentClick?: () => void;
}

export function Post({ user, avatar, postDate, caption, image, likes, comments, datePosted, onCommentClick }: PostProps) {
  const navigate = useNavigate();

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
            <p className="text-sm text-muted-foreground">{postDate}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem><Share2 className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
            <DropdownMenuItem><Flag className="w-4 h-4 mr-2" /> Report</DropdownMenuItem>
             {/* show only if user is the owner of the post */}
            <DropdownMenuItem><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem> 
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="">
        <p className="text-card-foreground">{caption}</p>
        {image && (
          <img
            src={image}
            alt="Post"
            className="w-full h-auto mt-4 rounded-lg"
          />
        )}
        <div className="flex items-center justify-between mt-4 text-muted-foreground">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 hover:text-destructive">
              <Heart className="w-5 h-5" /> {likes}
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