import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface StoryProps {
  user: string;
  avatar: string;
  isLive: boolean;
  hasStory: boolean;
  stories: Array<{
    _id: string;
    author: string;
    privacy: number;
    contentType: string;
    taggedUsers: string[] | null;
    hideFrom: string[];
    createdAt: number;
    url: string;
    status: number;
    ago_time: string;
    seen: number;
  }>;
  latestStoryTime: number;
  liveRingColor?: string;
  defaultRingColor?: string;
}

export const Story: FC<StoryProps> = ({ 
  user, 
  avatar, 
  isLive,
  liveRingColor = 'ring-primary',
  defaultRingColor = 'ring-muted'
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex flex-col items-center space-y-1 mx-2 my-1"
      onClick={() => navigate('/story')}
      role="button"
      tabIndex={0}
    >
      <div className={`relative w-16 h-16 rounded-full ${
        isLive 
          ? `ring-2 ${liveRingColor}` 
          : `ring-2 ${defaultRingColor}`
      }`}>
        <img 
          src={avatar} 
          alt={user} 
          className="w-full h-full rounded-full object-cover p-[2px] bg-background"
        />
        {isLive && (
          <span className={`absolute bottom-0 text-[10px] text-background ${liveRingColor.split(' ')[0]} px-2 rounded-full left-1/2 -translate-x-1/2`}>
            live
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{user}</span>
    </div>
  );
}; 