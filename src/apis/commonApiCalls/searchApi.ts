import apiClient from "@/apis/apiClient";
import { SearchRequest } from "../apiTypes/request";
import { SearchResponse, Person } from "../apiTypes/response";

export type { Person };

export const searchPeople = async (query: string): Promise<SearchResponse> => {
  // Validate required field
  if (!query.trim()) {
    return {
      success: true,
      message: "No search query provided",
      users: [],
    };
  }

  const searchData: SearchRequest = {
    searchString: query,
  };

  const response = await apiClient.post<SearchResponse>("/search", searchData);

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to search users");
  }
};
