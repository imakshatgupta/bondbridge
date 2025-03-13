import React, { useState } from "react";
import avatar from "@/assets/avatar.png";
import StoryPage from "@/components/StoryPage";

const HomePage = () => {
  const [showStory, setShowStory] = useState(false);
  const [storyUserIndex, setStoryUserIndex] = useState(0);
  
  const usersWithStories = [
    {
      id: "1",
      name: "Michel Kimfalk",
      avatar: avatar,
      stories: [
        { id: "s1", image: avatar, text: "We will onboard your new hello & offer club benefits" },
        { id: "s2", image: avatar, text: "Check out our latest features" },
      ]
    },
    {
      id: "2",
      name: "Jane Doe",
      avatar: avatar,
      stories: [
        { id: "s3", image: avatar, text: "Beautiful sunset today!" },
        { id: "s4", image: avatar, text: "My new project" },
      ]
    },
  ];
  
  const handleStoryClick = (userIndex: number) => {
    setStoryUserIndex(userIndex);
    setShowStory(true);
  };
  
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-4">
          {usersWithStories.map((user, index) => (
            <div 
              key={user.id} 
              className="flex flex-col items-center"
              onClick={() => handleStoryClick(index)}
            >
              <div className="w-16 h-16 rounded-full border-2 border-primary p-0.5 cursor-pointer">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
              <span className="text-xs mt-1 text-center">{user.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {showStory && (
        <StoryPage 
          users={usersWithStories}
          initialUserIndex={storyUserIndex}
          initialStoryIndex={0}
          onClose={() => setShowStory(false)}
        />
      )}
    </div>
  );
};

export default HomePage; 