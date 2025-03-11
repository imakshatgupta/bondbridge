import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, MoreVertical, Share2, Flag } from "lucide-react";
import avatar from "/activity/cat.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileProps {
  username: string;
  email: string;
  followers: number;
  following: number;
  avatarSrc: string;
  isCurrentUser?: boolean;
}

const Profile: React.FC<ProfileProps> = ({
  username,
  email,
  followers,
  following,
  avatarSrc,
  isCurrentUser = false,
}) => {
  const [activeTab, setActiveTab] = useState<"posts" | "audio" | "replies">("posts");
  const navigate = useNavigate();

  // Mock data for demonstration
  const posts = [
    { id: 1, imageSrc: avatar },
    { id: 2, imageSrc: avatar },
    { id: 3, imageSrc: avatar },
    { id: 4, imageSrc: avatar },
    { id: 5, imageSrc: avatar },
    { id: 6, imageSrc: avatar },
  ];

  const audios = [
    { id: 1, title: "Nature sounds", duration: "2:34" },
    { id: 2, title: "Morning birds", duration: "1:45" },
    { id: 3, title: "Ocean waves", duration: "3:21" },
  ];

  const replies = [
    { id: 1, text: "Great post!", author: "user123" },
    { id: 2, text: "I love this content", author: "nature_lover" },
    { id: 3, text: "Amazing photography", author: "photo_enthusiast" },
  ];

  return (
    <div className="mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-0">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        {isCurrentUser ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">Go Anonymous</span>
            <Switch />
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="w-4 h-4 mr-2" /> Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
          <img src={avatarSrc || "avatar.png"} alt={username} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-semibold">{username}</h1>
        <p className="text-muted-foreground text-sm mb-4">{email}</p>
        
        <div className="flex gap-8 mb-4">
          <div className="text-center">
            <div className="font-semibold">{followers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">followers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{following.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">following</div>
          </div>
        </div>
        
        {isCurrentUser ? (
          <button className="p-2 rounded-full border">
            <Settings size={20} />
          </button>
        ) : (
          <div className="flex gap-2 w-full max-w-[200px]">
            <Button variant="outline" className="flex-1">
              Message
            </Button>
            <Button className="flex-1">
              Add Friend
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button 
          className={`flex-1 py-3 text-center ${
            activeTab === "posts" 
              ? "border-b-2 border-primary font-medium text-primary" 
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button 
          className={`flex-1 py-3 text-center ${
            activeTab === "audio" 
              ? "border-b-2 border-primary font-medium text-primary" 
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("audio")}
        >
          Audio
        </button>
        <button 
          className={`flex-1 py-3 text-center ${
            activeTab === "replies" 
              ? "border-b-2 border-primary font-medium text-primary" 
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("replies")}
        >
          replies
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1">
            {posts.map(post => (
              <div key={post.id} className="aspect-square overflow-hidden">
                <img src={post.imageSrc} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {activeTab === "audio" && (
          <div className="space-y-3">
            {audios.map(audio => (
              <div key={audio.id} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{audio.title}</h3>
                  <span className="text-sm text-muted-foreground">{audio.duration}</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center">
                  ▶
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "replies" && (
          <div className="space-y-4">
            {replies.map(reply => (
              <div key={reply.id} className="p-3 border rounded-lg">
                <div className="font-medium mb-1">@{reply.author}</div>
                <p className="text-foreground">{reply.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 