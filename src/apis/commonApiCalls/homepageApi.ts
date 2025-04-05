import apiClient from "@/apis/apiClient";
import {
  FetchHomepageDataResponse,
  FetchPostsResponse,
  FetchStoriesResponse,
  GetPostDetailsResponse,
  GetSuggestedUsersResponse,
  HomePostData,
} from "@/apis/apiTypes/response";
import { GetPostDetailsRequest } from "@/apis/apiTypes/request";

/**
 * Function to fetch posts for the homepage
 */
export const fetchPosts = async (page: number): Promise<FetchPostsResponse> => {
  try {
    const response = await apiClient.get<{
      message: string;
      count: number;
      posts: HomePostData[];
    }>("/get-home-posts", {
      params: { page },
    });

    // Handle the actual response structure
    if (response.status === 200) {
      // Sort posts by createdAt in ascending order (earlier posts first)
      const sortedPosts = [...(response.data.posts || [])].sort(
        (a, b) => b.createdAt - a.createdAt
      );

      return {
        success: true,
        posts: sortedPosts,
        hasMore: (response.data.posts || []).length > 0, // If we received posts, there might be more
        message: response.data.message,
        count: response.data.count,
      };
    } else {
      throw new Error(response.data.message || "Failed to fetch posts");
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch posts",
      posts: [],
      hasMore: false,
      count: 0,
    };
  }
};

/**
 * Function to fetch stories for the homepage
 */
export const fetchStories = async (): Promise<FetchStoriesResponse> => {
  try {
    const response = await apiClient.get<FetchStoriesResponse>("/get-stories");

    if (response.status === 200) {
      return {
        success: true,
        stories: response.data.stories || [],
        message: response.data.message,
      };
    } else {
      throw new Error(response.data.message || "Failed to fetch stories");
    }
  } catch (error) {
    console.error("Error fetching stories:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch stories",
      stories: [],
    };
  }
};

/**
 * Function to fetch both posts and stories in parallel for the homepage
 */
export const fetchHomepageData = async (
  page: number
): Promise<FetchHomepageDataResponse> => {
  try {
    // Fetch posts and stories in parallel
    const [postsData, storiesData] = await Promise.all([
      fetchPosts(page),
      fetchStories(),
    ]);

    console.log("postsData", postsData);

    return {
      success: true,
      postsData,
      storiesData,
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch homepage data",
      postsData: {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch posts",
        posts: [],
        hasMore: false,
        count: 0,
      },
      storiesData: {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch stories",
        stories: [],
      },
    };
  }
};

/**
 * Function to fetch details of a specific post
 */
export const getPostDetails = async (
  requestData: GetPostDetailsRequest
): Promise<GetPostDetailsResponse> => {
  const { feedId } = requestData;

  if (!feedId) {
    throw new Error("Feed ID is required");
  }
  const response = await apiClient.get<GetPostDetailsResponse>(
    `/get-post-details`,
    { params: { feedId } }
  );

  console.log("response", response);

  if (response.status === 200 && response.data) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch post details");
  }
};

/**
 * Function to fetch suggested users for the sidebar
 */
export const getSuggestedUsers =
  async (): Promise<GetSuggestedUsersResponse> => {
    const response = await apiClient.get<GetSuggestedUsersResponse>(
      "/getAllUsers"
    );

    if (response.status === 200) {
      return {
        success: true,
        users: response.data.users || [],
        message: response.data.message,
      };
    } else {
      throw new Error(
        response.data.message || "Failed to fetch suggested users"
      );
    }
  };
