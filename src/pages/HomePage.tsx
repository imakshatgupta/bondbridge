import { Post } from "@/components/Post";
import { Story } from "@/components/Story";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchHomepageData } from "@/apis/commonApiCalls/homepageApi";
import { HomepageResponse, HomePostData, StoryData } from "@/apis/apiTypes/response";
import { useApiCall } from "@/apis/globalCatchError";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostSkeleton } from "@/components/skeletons/PostSkeleton";
import { StoryRowSkeleton } from "@/components/skeletons/StorySkeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshCw, ImageIcon, AlertCircle, Plus } from "lucide-react";
import { getSelfStories } from "@/apis/commonApiCalls/storyApi";
import { useAppSelector } from "@/store";

export default function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<HomePostData[]>([]);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [selfStories, setSelfStories] = useState<StoryData | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUser = useAppSelector(state => state.currentUser);
  
  // Use our custom hook for API calls
  const [executeFetchHomepageData, isLoading] = useApiCall(fetchHomepageData);
  const [executeGetSelfStories, isLoadingSelfStories] = useApiCall(getSelfStories);
  
  // Get current user ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);
  
  // Load initial data
  useEffect(() => {
    const loadHomepageData = async () => {
      // Fetch self stories first
      const selfStoriesResult = await executeGetSelfStories();
      if (selfStoriesResult.success && selfStoriesResult.data) {
        setSelfStories(selfStoriesResult.data);
      }

      // Then fetch homepage data
      const result = await executeFetchHomepageData(1);
      console.log(result.data);
      
      if (result.success && result.data) {
        const { postsData, storiesData } = result.data as HomepageResponse;
        
        setPosts(postsData.posts);
        
        // Sort stories to show users with unseen stories first
        const sortedStories = [...storiesData.stories].sort((a, b) => {
          // Check if user A has any unseen stories
          const aHasUnseenStories = a.stories.some(story => story.seen === 0);
          // Check if user B has any unseen stories
          const bHasUnseenStories = b.stories.some(story => story.seen === 0);
          
          if (aHasUnseenStories && !bHasUnseenStories) {
            return -1; // A comes first
          } else if (!aHasUnseenStories && bHasUnseenStories) {
            return 1; // B comes first
          } else {
            // If both have the same seen status, sort by latest story time
            return b.latestStoryTime - a.latestStoryTime;
          }
        });
        
        setStories(sortedStories);
        setHasMore(postsData.hasMore || false);
      } else {
        setError(result.data?.message || 'Failed to load homepage data');
      }
    };
    
    loadHomepageData();
  }, []);
  
  // Function to load more posts
  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;
    
    const nextPage = page + 1;
    const result = await executeFetchHomepageData(nextPage);
    
    if (result.success && result.data) {
      const { postsData } = result.data as HomepageResponse;

      setPosts(prev => [...prev, ...postsData.posts]);
      setHasMore(postsData.hasMore || false);
      setPage(nextPage);
    }
  };

  // Use infinite scroll hook
  const lastPostElementRef = useInfiniteScroll({
    isLoading,
    hasMore,
    onLoadMore: loadMorePosts
  });
  
  const handleLikeClick = (postId: string) => {
    console.log(postId);
  };

  const handleCommentClick = (postId: string, postData: HomePostData) => {
    navigate(`/post/${postId}`, { state: { postData } });
  };
  
  // Render loading skeletons
  if (isLoading && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <StoryRowSkeleton />
        {Array.from({ length: 3 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load feed"
          description={error}
          actionLabel="Try Again"
          actionIcon={RefreshCw}
          onAction={() => window.location.reload()}
          className="my-8"
        />
      </div>
    );
  }

  // Prepare stories for display - format self story only once
  const formattedSelfStory = selfStories ? {
    user: "Your Story",
    userId: currentUserId || '',
    avatar: currentUser.avatar || '/profile/avatars/1.png',
    isLive: false,
    hasStory: selfStories.stories && selfStories.stories.length > 0,
    stories: selfStories.stories || [],
    latestStoryTime: selfStories.latestStoryTime || Date.now(),
    name: "Your Story",
    profilePic: currentUser.avatar || '/profile/avatars/1.png'
  } : null;

  // Format all stories for the StoryPage component
  const allFormattedStories = [
    ...(formattedSelfStory ? [formattedSelfStory] : []),
    ...stories.map(story => ({
      user: story.name,
      userId: story.userId,
      avatar: story.profilePic,
      isLive: story.isLive,
      hasStory: story.hasStory,
      stories: story.stories,
      latestStoryTime: story.latestStoryTime,
      name: story.name,
      profilePic: story.profilePic
    }))
  ].filter(Boolean);
  
  return (
    <div className="max-w-2xl mx-auto bg-background">
      {/* Stories Section */}
      {isLoading || isLoadingSelfStories ? (
        <StoryRowSkeleton />
      ) : (
        <div className="mb-2 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {/* Self Story */}
            <div className="relative">
              {formattedSelfStory && formattedSelfStory.stories && formattedSelfStory.stories.length > 0 ? (
                <Story
                  key="self-story"
                  user={formattedSelfStory.user}
                  userId={formattedSelfStory.userId}
                  avatar={formattedSelfStory.avatar}
                  isLive={formattedSelfStory.isLive}
                  hasStory={formattedSelfStory.hasStory}
                  stories={formattedSelfStory.stories}
                  latestStoryTime={formattedSelfStory.latestStoryTime}
                  allStories={allFormattedStories}
                  storyIndex={0}
                />
              ) : (
                <div className="flex flex-col items-center space-y-1 mx-2 my-1">
                  <div className="relative w-16 h-16 rounded-full ring-2 ring-muted">
                    <img 
                      src={currentUser.avatar || '/profile/avatars/1.png'} 
                      alt="Your Story" 
                      className="w-full h-full rounded-full object-cover p-[2px] bg-background"
                    />
                    <button
                      onClick={() => navigate('/create-story')}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors duration-200 border-2 border-background"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">Your Story</span>
                </div>
              )}
            </div>
            {/* Other Stories */}
            {stories.map((story, index) => (
              <Story
                key={`story-${story.userId || index}`}
                user={story.name}
                userId={story.userId}
                avatar={story.profilePic}
                isLive={story.isLive}
                hasStory={story.hasStory}
                stories={story.stories}
                latestStoryTime={story.latestStoryTime}
                allStories={allFormattedStories}
                storyIndex={index + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div
            key={`post-${post._id || index}`}
            ref={index === posts.length - 1 ? lastPostElementRef : undefined}
          >
            <Post 
              user={post.name}
              avatar={post.profilePic}
              userId={post.userId}
              caption={post.data.content}
              media={post.data.media}
              image={post.data.media && post.data.media.length > 0 ? post.data.media[0].url : undefined}
              likes={post.reactionCount}
              comments={post.commentCount}
              datePosted={post.ago_time}
              isOwner={currentUserId === post.userId}
              onCommentClick={() => handleCommentClick(post.feedId, post)}
              onLikeClick={() => handleLikeClick(post._id)}
              feedId={post.feedId}
            />
          </div>
        ))
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No posts yet"
          description="There are no posts in your feed right now. Follow more people to see their posts here."
          className="my-8"
        />
      )}
      
      {/* Loading indicator for more posts */}
      {isLoading && posts.length > 0 && (
        <div className="py-4">
          <PostSkeleton />
        </div>
      )}
      
      {/* End of content message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 mb-4 text-muted-foreground border-t border-border">
          <p className="text-sm font-medium">You're all caught up</p>
          <p className="text-xs">No more posts to load</p>
        </div>
      )}
    </div>
  );
}
