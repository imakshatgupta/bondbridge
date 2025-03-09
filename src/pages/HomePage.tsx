import { useState } from "react";
import { MoreHorizontal, Trash, Flag, Share2, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface HomePageProps {
  user: string;
  avatar: string;
  postDate: string;
  caption: string;
  image: string;
  likes: number;
  comments: number;
  datePosted: string;
}

export default function HomePage({ user, avatar, postDate, caption, image, likes, comments, datePosted }: HomePageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <Card className="p-4 shadow-md rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatar} alt={user} />
              <AvatarFallback>{user?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user}</p>
              <p className="text-sm text-gray-500">{postDate}</p>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreHorizontal />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white shadow-md rounded-lg overflow-hidden z-10">
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100">
                  <Trash className="w-4 h-4" /> Delete
                </button>
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100">
                  <Flag className="w-4 h-4" /> Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            )}
          </div>
        </div>
        <CardContent className="mt-4">
          <p className="text-gray-700">{caption}</p>
          {image && (
            <img
              src={image}
              alt="Post"
              className="w-full h-auto mt-4 rounded-lg"
            />
          )}
          <div className="flex items-center justify-between mt-4 text-gray-500">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 hover:text-red-500">
                <Heart className="w-5 h-5" /> {likes}
              </button>
              <button className="flex items-center gap-1 hover:text-blue-500">
                <MessageCircle className="w-5 h-5" /> {comments}
              </button>
            </div>
            <div className="text-sm text-gray-500 mr-3">{datePosted}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


