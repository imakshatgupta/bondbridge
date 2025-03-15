import apiClient from '@/apis/apiClient';
import { 
  FetchHomepageDataResponse,
  FetchPostsResponse,
  FetchStoriesResponse,
} from '@/apis/apiTypes/response';

/**
 * Function to fetch posts for the homepage
 */
export const fetchPosts = async (page: number): Promise<FetchPostsResponse> => {
  try {
    const response = await apiClient.get<FetchPostsResponse>(
      '/get-home-posts',
      {
        params: { page }
      }
    );

    // Handle the actual response structure
    if (response.status === 200) {
      return {
        success: true,
        posts: response.data.posts || [],
        hasMore: response.data.hasMore || false,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch posts');
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch posts',
      posts: [],
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
      '/get-stories'
    );
    
    if (response.status === 200) {
      return {
        success: true,
        stories: response.data.stories || [],
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch stories');
    }
  } catch (error) {
    console.error('Error fetching stories:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch stories',
      stories: []
    };
  }
};

/**
 * Function to fetch both posts and stories in parallel for the homepage
 */
export const fetchHomepageData = async (page: number): Promise<FetchHomepageDataResponse> => {
  try {
    // Fetch posts and stories in parallel
    const [postsData, storiesData] = await Promise.all([
      fetchPosts(page),
      fetchStories()
    ]);
    
    return {
      success: true,
      postsData,
      storiesData
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch homepage data',
      postsData: {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch posts',
        posts: [],
        hasMore: false
      },
      storiesData: {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch stories',
        stories: []
      }
    };
  }
};