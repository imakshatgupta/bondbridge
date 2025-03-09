import { FC } from "react";

interface StoryProps {
  user: string;
  avatar: string;
  isLive: boolean;
  liveRingColor?: string;
  defaultRingColor?: string;
}

export const Story: FC<StoryProps> = ({ 
  user, 
  avatar, 
  isLive, 
  liveRingColor = 'ring-pink-500 dark:ring-pink-400 ',
  defaultRingColor = 'ring-gray-300 dark:ring-gray-600'
}) => {
  return (
    <div className="flex flex-col items-center space-y-1 mx-2 my-1">
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