import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Pause, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback, useRef } from 'react';
import { saveStoryInteraction } from '@/apis/commonApiCalls/storyApi';
import { useApiCall } from '@/apis/globalCatchError';
import { StoryItem, StoryUser } from '@/types/story';

export default function StoryPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [allStories, setAllStories] = useState<StoryUser[]>([]);
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [videoDuration, setVideoDuration] = useState(5); // Default duration in seconds
    const [videoProgress, setVideoProgress] = useState(0); // 0 to 100 percentage
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Use our custom hook for API calls
    const [executeSaveInteraction] = useApiCall(saveStoryInteraction);

    // Initialize with the story data passed from the HomePage
    useEffect(() => {
        if (location.state) {
            const { currentStory, allStories: passedStories, initialUserIndex } = location.state;
            
            if (passedStories && passedStories.length > 0) {
                // Map the API story data to our StoryUser format
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const formattedStories = passedStories.map((story: any) => ({
                    user: story.name,
                    userId: story.userId,
                    avatar: story.profilePic,
                    isLive: story.isLive,
                    hasStory: story.hasStory,
                    stories: story.stories,
                    latestStoryTime: story.latestStoryTime
                }));
                
                setAllStories(formattedStories);
                
                // Set the initial user index
                const userIndex = initialUserIndex || 0;
                setCurrentUserIndex(userIndex);
                
                // Find the first unseen story for this user
                const firstUnseenIndex = formattedStories[userIndex]?.stories.findIndex(
                    (story: StoryItem) => story.seen === 0
                );
                
                // If there's an unseen story, start from there, otherwise start from the beginning
                if (firstUnseenIndex !== -1) {
                    setCurrentStoryIndex(firstUnseenIndex);
                } else {
                    setCurrentStoryIndex(0);
                }
            } else if (currentStory) {
                // If only a single story was passed
                setAllStories([currentStory]);
                
                // Find the first unseen story for this user
                const firstUnseenIndex = currentStory.stories.findIndex(
                    (story: StoryItem) => story.seen === 0
                );
                
                // If there's an unseen story, start from there, otherwise start from the beginning
                if (firstUnseenIndex !== -1) {
                    setCurrentStoryIndex(firstUnseenIndex);
                } else {
                    setCurrentStoryIndex(0);
                }
            } else {
                // If no story data is passed, navigate back to home
                navigate('/');
            }
        } else {
            // If no location state, navigate back to home
            navigate('/');
        }
        setIsLoading(false);
    }, [location.state, navigate]);

    // Define navigation functions with useCallback to prevent unnecessary re-renders
    const goToNextStory = useCallback(() => {
        if (allStories.length === 0) return;
        
        const totalStories = allStories[currentUserIndex]?.stories.length || 0;
        
        if (currentStoryIndex < totalStories - 1) {
            // Go to next story of the same user
            setCurrentStoryIndex(currentStoryIndex + 1);
        } else {
            // Move to next user if available
            if (currentUserIndex < allStories.length - 1) {
                setCurrentUserIndex(currentUserIndex + 1);
                
                // Find the first unseen story for the next user
                const nextUserIndex = currentUserIndex + 1;
                const firstUnseenIndex = allStories[nextUserIndex]?.stories.findIndex(
                    story => story.seen === 0
                );
                
                // If there's an unseen story, start from there, otherwise start from the beginning
                if (firstUnseenIndex !== -1) {
                    setCurrentStoryIndex(firstUnseenIndex);
                } else {
                    setCurrentStoryIndex(0);
                }
            } else {
                // If it's the last user's last story, go back to home
                navigate('/');
            }
        }
        
        // Reset video state when moving to next story
        setVideoEnded(false);
        setVideoProgress(0);
        setIsPaused(false);
    }, [allStories, currentUserIndex, currentStoryIndex, navigate]);

    const goToPreviousStory = useCallback(() => {
        if (allStories.length === 0) return;
        
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        } else {
            // Move to the previous user if available
            if (currentUserIndex > 0) {
                const prevUserStories = allStories[currentUserIndex - 1].stories.length;
                setCurrentUserIndex(currentUserIndex - 1);
                setCurrentStoryIndex(prevUserStories - 1);
            }
        }
        
        // Reset video state when moving to previous story
        setVideoEnded(false);
        setVideoProgress(0);
        setIsPaused(false);
    }, [allStories, currentUserIndex, currentStoryIndex]);

    // Reset video progress when story changes
    useEffect(() => {
        setVideoProgress(0);
        setVideoEnded(false);
        setIsPaused(false);
    }, [currentUserIndex, currentStoryIndex]);

    // Mark story as seen when it's viewed
    useEffect(() => {
        if (!isLoading && allStories.length > 0) {
            const currentStoryItem = allStories[currentUserIndex]?.stories[currentStoryIndex];
            
            if (currentStoryItem && currentStoryItem.seen === 0) {
                // Call the API to mark the story as seen
                executeSaveInteraction(currentStoryItem._id);
                
                // Update the local state to mark the story as seen
                const updatedStories = [...allStories];
                updatedStories[currentUserIndex].stories[currentStoryIndex].seen = 1;
                setAllStories(updatedStories);
            }
        }
    }, [currentUserIndex, currentStoryIndex, isLoading, allStories, executeSaveInteraction]);

    // Handle video playback when story changes
    useEffect(() => {
        if (!isLoading && allStories.length > 0) {
            const currentStoryItem = allStories[currentUserIndex]?.stories[currentStoryIndex];
            
            if (currentStoryItem?.contentType === 'video' && videoRef.current) {
                // Reset video state
                videoRef.current.currentTime = 0;
                setVideoProgress(0);
                setVideoEnded(false);
                
                // Play the video
                const playPromise = videoRef.current.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsVideoPlaying(true);
                            setIsPaused(false);
                        })
                        .catch(error => {
                            console.error("Video playback failed:", error);
                            // If autoplay is prevented, we need to show play button
                            setIsVideoPlaying(false);
                            setIsPaused(true);
                        });
                }
            }
        }
    }, [currentUserIndex, currentStoryIndex, isLoading, allStories]);

    // Handle video ended state to advance to next story
    useEffect(() => {
        if (videoEnded) {
            // Set progress to 100% before moving to next story
            setVideoProgress(100);
            
            // Add a small delay to show the completed progress bar before moving to next story
            const timer = setTimeout(() => {
                goToNextStory();
            }, 500); // Increased delay for better visibility
            
            return () => clearTimeout(timer);
        }
    }, [videoEnded, goToNextStory]);

    // Auto-advance to the next story after duration (5s for images, video duration for videos)
    useEffect(() => {
        // Only set up the timer if we have stories loaded and not paused
        if (!isLoading && allStories.length > 0 && !isPaused) {
            const currentStoryItem = allStories[currentUserIndex]?.stories[currentStoryIndex];
            
            // Only use timer for image content types
            if (currentStoryItem?.contentType !== 'video') {
                const timer = setTimeout(() => {
                    goToNextStory();
                }, 5000);
                
                return () => clearTimeout(timer);
            }
        }
    }, [currentUserIndex, currentStoryIndex, isLoading, allStories.length, goToNextStory, isPaused]);

    // Toggle video play/pause
    const toggleVideoPlayback = useCallback(() => {
        if (!videoRef.current) return;
        
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsVideoPlaying(true);
            setIsPaused(false);
        } else {
            videoRef.current.pause();
            setIsVideoPlaying(false);
            setIsPaused(true);
        }
    }, []);

    // Update video progress
    const updateVideoProgress = useCallback(() => {
        if (!videoRef.current || videoDuration <= 0) return;
        
        const currentTime = videoRef.current.currentTime;
        const progressPercentage = (currentTime / videoDuration) * 100;
        setVideoProgress(progressPercentage);
    }, [videoDuration]);

    // Add keyboard event listener for arrow key navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                goToPreviousStory();
            } else if (event.key === 'ArrowRight') {
                goToNextStory();
            } else if (event.key === 'Escape') {
                navigate(-1); // Go back to the previous page
            } else if (event.key === ' ') { // Space bar
                const currentStoryItem = allStories[currentUserIndex]?.stories[currentStoryIndex];
                if (currentStoryItem?.contentType === 'video') {
                    toggleVideoPlayback();
                }
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);

        // Clean up
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [goToNextStory, goToPreviousStory, navigate, allStories, currentUserIndex, currentStoryIndex, toggleVideoPlayback]);

    // If still loading or no stories, show a loading state
    if (isLoading || allStories.length === 0) {
        return <div className="flex items-center justify-center h-screen">Loading stories...</div>;
    }

    const currentUser = allStories[currentUserIndex];
    const totalStories = currentUser.stories.length;
    const currentStoryItem = currentUser.stories[currentStoryIndex];
    const isVideo = currentStoryItem.contentType === 'video';

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
                    {Array.from({ length: totalStories }).map((_, index) => {
                        // Determine if this story item is a video
                        
                        return (
                            <div
                                key={index}
                                className="h-1 flex-1 rounded-full overflow-hidden bg-muted"
                            >
                                <div
                                    className={`h-full bg-primary transition-all duration-300 ${
                                        index < currentStoryIndex ? 'w-full' :
                                        index === currentStoryIndex && !isVideo ? 'w-full animate-progress' : 
                                        index === currentStoryIndex && isVideo ? '' : 'w-0'
                                    }`}
                                    style={{
                                        width: index === currentStoryIndex && isVideo ? `${videoProgress}%` : undefined,
                                        animationDuration: index === currentStoryIndex && !isVideo ? '5s' : '0s',
                                        animationPlayState: isPaused ? 'paused' : 'running'
                                    }}
                                />
                            </div>
                        );
                    })}
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
                                <AvatarFallback>{currentUser.user[0]}</AvatarFallback>
                            </Avatar>
                            <div 
                                className="cursor-pointer" 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the parent's onClick
                                    navigate(`/profile/${currentUser.userId}`);
                                }}
                            >
                                <p className="font-semibold text-sm text-foreground">{currentUser.user}</p>
                                <p className="text-xs text-muted-foreground">{currentStoryItem.ago_time}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Story Content */}
                <div
                    className="h-[calc(100vh-104px)] w-full flex items-center justify-center bg-background relative"
                    onClick={isVideo ? toggleVideoPlayback : goToNextStory}
                >
                    {isVideo ? (
                        <>
                            <video
                                ref={videoRef}
                                src={currentStoryItem.url}
                                className="w-full h-full p-4 object-contain"
                                playsInline
                                preload="auto"
                                onLoadedMetadata={(e) => {
                                    const target = e.target as HTMLVideoElement;
                                    setVideoDuration(target.duration);
                                }}
                                onTimeUpdate={updateVideoProgress}
                                onEnded={() => {
                                    // When video ends, set videoEnded flag to true and ensure progress is 100%
                                    setVideoEnded(true);
                                    setVideoProgress(100);
                                }}
                                onPlay={() => {
                                    setIsVideoPlaying(true);
                                    setIsPaused(false);
                                }}
                                onPause={() => {
                                    // Only set video as paused if it hasn't ended
                                    if (!videoEnded) {
                                        setIsVideoPlaying(false);
                                        setIsPaused(true);
                                    }
                                }}
                            />
                            {/* Video Controls Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                {!isVideoPlaying && !videoEnded && (
                                    <button 
                                        className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center pointer-events-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleVideoPlayback();
                                        }}
                                    >
                                        {isPaused ? (
                                            <Play className="h-8 w-8 text-primary-foreground" />
                                        ) : (
                                            <Pause className="h-8 w-8 text-primary-foreground" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <img
                            src={currentStoryItem.url}
                            alt="Story content"
                            className="w-full h-full p-4 object-contain"
                        />
                    )}
                </div>

                {/* Emojis */}
                <div className="absolute bottom-15 left-0 right-0 flex justify-center">
                    <div className="flex space-x-1 px-2">
                        {["🔥", "😍", "😎", "😂"].map((emoji, index) => (
                            <button
                                key={index}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary active:bg-primary/20"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the parent's onClick
                                    /* Add reaction logic here */
                                }}
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
                            onClick={(e) => e.stopPropagation()} // Prevent triggering the parent's onClick
                        />
                        <button 
                            className="p-2 rounded-full bg-primary text-primary-foreground"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent's onClick
                                /* Add send message logic here */
                            }}
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
