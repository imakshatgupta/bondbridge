import { Post } from "@/components/Post";
import { Story } from "@/components/Story";
import avatarImage from "/activity/cat.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

// Fallback story data in case the API fails
const fallbackStoryData = [
  { id: 1, user: "name one", avatar: avatarImage, isLive: true },
  { id: 2, user: "name two", avatar: avatarImage, isLive: false },
  { id: 3, user: "name three", avatar: avatarImage, isLive: false },
  { id: 4, user: "name four", avatar: avatarImage, isLive: false },
];

// Fallback data in case the API fails
const fallbackPostsData = [
  {
    id: 1,
    user: "John Doe",
    avatar: avatarImage,
    postDate: "2024-03-21",
    caption: "Hello world!",
    image: avatarImage,
    likes: 210,
    comments: 32,
    datePosted: "2 days ago"
  },
  {
    id: 2,
    user: "Jane Smith",
    avatar: avatarImage,
    postDate: "2024-03-22",
    caption: "Beautiful day outside!",
    image: avatarImage,
    likes: 145,
    comments: 18,
    datePosted: "1 day ago"
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(fallbackPostsData);
  const [stories, setStories] = useState(fallbackStoryData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get userId and token from localStorage
        // const userId = localStorage.getItem('userId');
        // const token = localStorage.getItem('token');
        const userId = '67d00b147b762b88b1e49496';
        const token = '6a0RdRmErNgSQzDN7H69oLTIrMBKoIwy0fVcyKA9Jdp1Ysdw2FNk82fPFU3tP7YA';
        
        if (!userId || !token) {
          throw new Error('Authentication data not found. Please login again.');
        }

        const headers = {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
          'userId': userId,
          'token': token
        };
        
        // Fetch posts and stories in parallel
        const [postsResponse, storiesResponse] = await Promise.all([
          fetch(`${apiUrl}/api/get-home-posts`, {
            method: 'GET',
            headers
          }),
          fetch(`${apiUrl}/api/get-stories`, {
            method: 'GET',
            headers
          })
        ]);
        
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        if (!storiesResponse.ok) {
          throw new Error('Failed to fetch stories');
        }
        
        const postsData = await postsResponse.json();
        const storiesData = await storiesResponse.json();
        
        setPosts(postsData.posts?.length ? postsData.posts : fallbackPostsData);
        setStories(storiesData.stories?.length ? storiesData.stories : fallbackStoryData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCommentClick = (postId: number) => {
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
        posts.map((post) => (
          <Post 
            key={post.id}
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
        ))
      ) : (
        <div className="text-center py-4">No posts available</div>
      )}
    </div>
  );
}