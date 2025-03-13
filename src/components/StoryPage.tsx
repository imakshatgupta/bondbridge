import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import avatar from "@/assets/avatar.png";

interface Story {
  id: string;
  image: string;
  text: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  stories: Story[];
}

interface StoryPageProps {
  users: User[];
  initialUserIndex: number;
  initialStoryIndex: number;
  onClose: () => void;
}

const StoryPage: React.FC<StoryPageProps> = ({
  users,
  initialUserIndex = 0,
  initialStoryIndex = 0,
  onClose,
}) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [inputValue, setInputValue] = useState("");
  const [progress, setProgress] = useState(0);

  const currentUser = users[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  const totalStories = currentUser?.stories.length || 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds per story (50ms * 100)

    return () => clearInterval(timer);
  }, [currentUserIndex, currentStoryIndex]);

  const handlePrevStory = () => {
    setProgress(0);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(users[currentUserIndex - 1].stories.length - 1);
    } else {
      onClose();
    }
  };

  const handleNextStory = () => {
    setProgress(0);
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handleSendReply = () => {
    // Handle sending reply logic here
    console.log("Sending reply:", inputValue);
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative max-w-md w-full h-[80vh] bg-background border rounded-lg overflow-hidden shadow-lg">
        {/* Progress indicators */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
          {Array.from({ length: totalStories }).map((_, index) => (
            <div key={index} className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ 
                  width: index < currentStoryIndex ? '100%' : 
                         index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center p-4 pt-6 z-10">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
              <img 
                src={currentUser?.avatar || avatar} 
                alt={currentUser?.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="ml-2">
              <p className="font-medium text-sm">{currentUser?.name}</p>
            </div>
          </div>
        </div>

        {/* Story content */}
        <div className="h-full flex items-center justify-center">
          <img 
            src={currentStory?.image || avatar} 
            alt="Story" 
            className="w-full h-full object-contain" 
          />
          {currentStory?.text && (
            <div className="absolute bottom-20 left-0 right-0 p-4 text-center">
              <p className="text-lg font-medium text-foreground bg-background/70 p-2 rounded">
                {currentStory.text}
              </p>
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        <button 
          onClick={handlePrevStory}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/30 flex items-center justify-center text-foreground hover:bg-background/50"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={handleNextStory}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/30 flex items-center justify-center text-foreground hover:bg-background/50"
        >
          <ArrowRight size={20} />
        </button>

        {/* Reply input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={avatar} alt="Your avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="What's on your mind..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-muted"
              />
              <Button 
                size="icon" 
                className="bg-primary text-primary-foreground rounded-full"
                onClick={handleSendReply}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Emoji reactions */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 p-2">
          <button className="text-xl">🔥</button>
          <button className="text-xl">😍</button>
          <button className="text-xl">😮</button>
          <button className="text-xl">❤️</button>
          <button className="text-xl">➕</button>
        </div>
      </div>
    </div>
  );
};

export default StoryPage; 