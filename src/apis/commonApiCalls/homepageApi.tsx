import apiClient from '@/apis/apiClient';
import { 
  FetchHomepageDataResponse,
  FetchPostsResponse,
  FetchStoriesResponse,
  HomePostData,
  StoryData
} from '@/apis/apiTypes/response';

// Fallback data that can be used directly in this file
import avatarImage from "/activity/cat.png";

// Fallback story data
export const fallbackStoryData: StoryData[] = [
  { id: 1, user: "name one", avatar: avatarImage, isLive: true },
  { id: 2, user: "name two", avatar: avatarImage, isLive: false },
  { id: 3, user: "name three", avatar: avatarImage, isLive: false },
  { id: 4, user: "name four", avatar: avatarImage, isLive: false },
];

// Fallback posts data
export const fallbackPostsData: HomePostData[] = [
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

/**
 * Function to fetch posts for the homepage
 */
export const fetchPosts = async (): Promise<FetchPostsResponse> => {
  try {
    const response = await apiClient.get<FetchPostsResponse>(
      '/get-home-posts',
    );
    
    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        posts: response.data.posts?.length ? response.data.posts : fallbackPostsData,
        hasMore: response.data.hasMore || false
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch posts');
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch posts',
      posts: fallbackPostsData,
      hasMore: false
    };
  }
};

/**
 * Function to fetch stories for the homepage
 */
export const fetchStories = async (): Promise<FetchStoriesResponse> => {
  try {
    const response = await apiClient.get<FetchStoriesResponse>(
      '/get-stories',
    );
    
    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        stories: response.data.stories?.length ? response.data.stories : fallbackStoryData
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch stories');
    }
  } catch (error) {
    console.error('Error fetching stories:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch stories',
      stories: fallbackStoryData
    };
  }
};

/**
 * Function to fetch both posts and stories in parallel for the homepage
 */
export const fetchHomepageData = async (_nextPage: number): Promise<FetchHomepageDataResponse> => {
  try {
    // Fetch posts and stories in parallel
    const [postsData, storiesData] = await Promise.all([
      fetchPosts(),
      fetchStories()
    ]);
    
    return {
      postsData,
      storiesData
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      postsData: {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch posts',
        posts: fallbackPostsData,
        hasMore: false
      },
      storiesData: {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch stories',
        stories: fallbackStoryData
      }
    };
  }
};