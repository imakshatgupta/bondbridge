import apiClient from "@/apis/apiClient";
import { SearchRequest } from "../apiTypes/request";
import { SearchResponse, Person } from "../apiTypes/response";

export type { Person };

export const searchPeople = async (query: string): Promise<SearchResponse> => {
  // Validate required field
  if (!query.trim()) {
    return {
      success: true,
      message: "No Search Query Provided",
      users: [],
    };
  }

  const searchData: SearchRequest = {
    searchString: query,
  };

  const response = await apiClient.post<SearchResponse>("/search", searchData);

  if (response.status === 200) {
    // Ensure profilePic is set properly in the response
    const processedResponse = {
      ...response.data,
      users: (response.data.users || []).map(user => ({
        ...user,
        // If profilePic is not already in the API response, use avatar as fallback
        profilePic: user.profilePic || user.avatar
      }))
    };
    return processedResponse;
  } else {
    throw new Error(response.data.message || "Failed to search users");
  }
};
