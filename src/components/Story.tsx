import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { StoryProps } from "@/types/story";

export const Story: FC<StoryProps> = ({ 
  user, 
  userId,
  avatar, 
  isLive,
  hasStory,
  stories,
  latestStoryTime,
  liveRingColor = 'ring-primary',
  defaultRingColor = 'ring-muted',
  unseenRingColor = 'ring-blue-500',
  allStories = [],
  storyIndex = 0,
  usernameLengthLimit = 10
}) => {
  const navigate = useNavigate();

  // Check if user has any unseen stories
  const hasUnseenStories = stories.some(story => story.seen === 0);

  const handleStoryClick = () => {
    navigate('/story', { 
      state: { 
        currentStory: {
          user,
          userId,
          avatar,
          isLive,
          hasStory,
          stories,
          latestStoryTime
        },
        allStories,
        initialUserIndex: storyIndex
      }
    });
  };

  // Function to truncate username if it exceeds the limit
  const truncateUsername = (username: string): string => {
    if (username.length <= usernameLengthLimit) {
      return username;
    }
    return `${username.substring(0, usernameLengthLimit)}...`;
  };

  return (
    <div 
      className="flex flex-col items-center space-y-1 mx-2 my-1"
      onClick={handleStoryClick}
      role="button"
      tabIndex={0}
    >
      <div className={`relative w-16 h-16 rounded-full ${
        isLive 
          ? `ring-2 ${liveRingColor}` 
          : hasUnseenStories
            ? `ring-2 ${unseenRingColor}`
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
      <span className="text-xs text-muted-foreground" title={user}>{truncateUsername(user)}</span>
    </div>
  );
}; 