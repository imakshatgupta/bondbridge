import { Post } from "@/components/Post";
import { Story } from "@/components/Story";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchHomepageData, fallbackPostsData, fallbackStoryData } from "@/apis/commonApiCalls/homepageApi";
import { HomePostData, StoryData } from "@/apis/apiTypes/response";

export default function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<HomePostData[]>(fallbackPostsData);
  const [stories, setStories] = useState<StoryData[]>(fallbackStoryData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Load initial data
  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        const { postsData, storiesData } = await fetchHomepageData(1);
        
        setPosts(postsData.posts);
        setStories(storiesData.stories);
        setHasMore(postsData.hasMore || false);
        setLoading(false);
      } catch (err) {
        console.error('Error loading homepage data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    loadHomepageData();
  }, []);
  
  // Function to load more posts
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { postsData } = await fetchHomepageData(nextPage);
      
      setPosts(prev => [...prev, ...postsData.posts]);
      setHasMore(postsData.hasMore || false);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Setup intersection observer for infinite scroll
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    }, { threshold: 0.8 });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);
  
  const handleCommentClick = (postId: number | string) => {
    navigate(`/comments/${postId}`);
  };
  
  if (loading) {
    return <div className="max-w-2xl mx-auto p-4">Loading posts...</div>;
  }
  
  if (error) {
    return <div className="max-w-2xl mx-auto p-4 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="max-w-2xl mx-auto bg-background">
      {/* Stories Section */}
      <div className="mb-2 overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {stories.map((story) => (
            <Story
              key={story.id}
              user={story.user}
              avatar={story.avatar}
              isLive={story.isLive}
            />
          ))}
        </div>
      </div>

      {/* Posts Section */}
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div
            key={post.id}
            ref={index === posts.length - 1 ? lastPostElementRef : undefined}
          >
            <Post 
              user={post.user}
              avatar={post.avatar}
              postDate={post.postDate}
              caption={post.caption}
              image={post.image}
              likes={post.likes}
              comments={post.comments}
              datePosted={post.datePosted}
              onCommentClick={() => handleCommentClick(post.id)}
            />
          </div>
        ))
      ) : (
        <div className="text-center py-4">No posts available</div>
      )}
      
      {/* Loading indicator for more posts */}
      {loadingMore && (
        <div className="text-center py-4">Loading more posts...</div>
      )}
      
      {/* End of content message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">No more posts to load</div>
      )}
    </div>
  );
}