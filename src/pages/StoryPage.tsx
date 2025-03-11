import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import avatarImage from '@/assets/avatar.png';

const users = [
    {
        name: "Michel Smithwick",
        avatar: avatarImage,
        stories: [avatarImage],
    },
    {
        name: "Emma Johnson",
        avatar: avatarImage,
        stories: [avatarImage, avatarImage,avatarImage,avatarImage,avatarImage,],
    },
    {
        name: "John Doe",
        avatar: avatarImage,
        stories: [avatarImage,avatarImage,avatarImage,],
    }
];

export default function StoryPage() {
    const navigate = useNavigate();
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

    const currentUser = users[currentUserIndex];
    const totalStories = currentUser.stories.length;

    const goToNextStory = () => {
        if (currentStoryIndex < totalStories - 1) {
            // Go to next story of the same user
            setCurrentStoryIndex(currentStoryIndex + 1);
        } else {
            // Move to next user if available
            if (currentUserIndex < users.length - 1) {
                setCurrentUserIndex(currentUserIndex + 1);
                setCurrentStoryIndex(0); // Reset story index for new user
            } else {
                // If it's the last user's last story, restart from the first user
                setCurrentUserIndex(0);
                setCurrentStoryIndex(0);
            }
        }
    };

    const goToPreviousStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        } else {
            // Move to the previous user if available
            if (currentUserIndex > 0) {
                const prevUserStories = users[currentUserIndex - 1].stories.length;
                setCurrentUserIndex(currentUserIndex - 1);
                setCurrentStoryIndex(prevUserStories - 1);
            }
        }
    };

    return (
        <div className="max-w-sm mx-auto py-5 h-[calc(100vh-64px)] relative">
            {/* Left Navigation Arrow */}
            <button
                className="absolute left-[-80px] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-background shadow-md border border-border hover:bg-muted transition-colors duration-200"
                onClick={goToPreviousStory}
            >
                <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>

            {/* Right Navigation Arrow */}
            <button
                className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-background shadow-md border border-border hover:bg-muted transition-colors duration-200"
                onClick={goToNextStory}
            >
                <ArrowLeft className="h-5 w-5 text-foreground rotate-180" />
            </button>

            <div className='bg-background relative border border-border rounded-lg shadow-sm overflow-hidden'>
                <div className="absolute top-0 left-0 right-0 flex gap-1 z-10">
                    {Array.from({ length: totalStories }).map((_, index) => (
                        <div
                            key={index}
                            className="h-1 flex-1 rounded-full overflow-hidden bg-muted"
                        >
                            <div
                                className={`h-full bg-primary transition-all duration-300 ${index < currentStoryIndex ? 'w-full' :
                                    index === currentStoryIndex ? 'w-full' : 'w-0'
                                    }`}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-5 left-0 right-0 z-10 flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-1">
                            <ArrowLeft className="h-5 w-5 text-foreground" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.avatar} />
                                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm text-foreground">{currentUser.name}</p>
                                <p className="text-xs text-muted-foreground">2h ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Story Content */}
                <div
                    className="h-[calc(100vh-104px)] w-full flex items-center justify-center bg-background relative"
                    onClick={goToNextStory}
                >
                    <img
                        src={currentUser.stories[currentStoryIndex]}
                        alt="Story content"
                        className="w-full h-full p-4 object-contain"
                    />
                </div>

                {/* Emojis */}
                <div className="absolute bottom-15 left-0 right-0 flex justify-center">
                    <div className="flex space-x-1 px-2">
                        {["🔥", "😍", "😎", "😂"].map((emoji, index) => (
                            <button
                                key={index}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary active:bg-primary/20"
                                onClick={() => {/* Add reaction logic here */ }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reply Input */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="What's on your mind..."
                            className="bg-muted border-none rounded-full text-sm"
                        />
                        <button className="p-2 rounded-full bg-primary text-primary-foreground">
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
