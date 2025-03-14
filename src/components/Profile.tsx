import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings} from "lucide-react";
import avatar from "/activity/cat.png";
import { Button } from "@/components/ui/button";
import ThreeDotsMenu from "@/components/global/ThreeDotsMenu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AllPosts from "@/components/AllPosts";
import AllAudios from "@/components/AllAudios";
import AllReplies from "@/components/AllReplies";

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
          <ThreeDotsMenu
            showDelete={false}
            onShare={() => {/* handle share */}}
            onReport={() => {/* handle report */}}
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center pb-4 space-y-1">
        <div className="w-24 h-24 rounded-full overflow-hidden">
          <img src={avatarSrc || "avatar.png"} alt={username} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-semibold">{username}</h1>
        <p className="text-muted-foreground text-sm space-y-4">{email}</p>
        
        <div className="flex gap-8 py-3 mt-4">
          <div className="text-center">
            <div className="font-semibold">{followers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">followers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{following.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">following</div>
          </div>
          {isCurrentUser && (
            <button 
              className="p-2 rounded-full border h-fit"
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} />
            </button>
          )}
        </div>
        
        {!isCurrentUser && (
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
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-transparent *:rounded-none *:border-transparent 
        *:data-[state=active]:text-primary">
          <TabsTrigger value="posts" className="group">
            <span className="group-data-[state=active]:border-b-2 px-4 group-data-[state=active]:border-primary pb-2">Posts</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="group">
            <span className="group-data-[state=active]:border-b-2 px-4 group-data-[state=active]:border-primary pb-2">Audio</span>
          </TabsTrigger>
          <TabsTrigger value="replies" className="group">
            <span className="group-data-[state=active]:border-b-2 px-4 group-data-[state=active]:border-primary pb-2">Replies</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="p-4">
          <AllPosts posts={posts} />
        </TabsContent>

        <TabsContent value="audio" className="p-4">
          <AllAudios audios={audios} />
        </TabsContent>

        <TabsContent value="replies" className="p-4">
          <AllReplies replies={replies} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile; 