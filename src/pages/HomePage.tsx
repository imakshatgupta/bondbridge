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
import { RefreshCw, ImageIcon, AlertCircle } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<HomePostData[]>([]);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Use our custom hook for API calls
  const [executeFetchHomepageData, isLoading] = useApiCall(fetchHomepageData);
  
  // Get current user ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);
  
  // Load initial data
  useEffect(() => {
    const loadHomepageData = async () => {
      const result = await executeFetchHomepageData(1);
      console.log(result.data);
      
      if (result.success && result.data) {
        const { postsData, storiesData } = result.data as HomepageResponse;
        
        setPosts(postsData.posts);
        setStories(storiesData.stories);
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
    navigate(`/comments/${postId}`, { state: { postData } });
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
  
  return (
    <div className="max-w-2xl mx-auto bg-background">
      {/* Stories Section */}
      {isLoading && stories.length === 0 ? (
        <StoryRowSkeleton />
      ) : stories.length > 0 ? (
        <div className="mb-2 overflow-x-auto">
          <div className="flex gap-4 pb-2">
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
                allStories={stories}
                storyIndex={index}
              />
            ))}
          </div>
        </div>
      ) : null}

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