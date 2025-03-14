import apiClient from "../apiClient";
import { GetMessagesRequest } from "../apiTypes/request";
import {
  GetMessagesResponse,
  StartMessageResponse,
} from "../apiTypes/response";
import { StartMessageRequest } from "../apiTypes/request";

export const getMessages = async (
  request: GetMessagesRequest
): Promise<GetMessagesResponse> => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    throw new Error("User not authenticated");
  }

  try {
    const response = await apiClient.post("/get-all-messages", request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const startMessage = async (
  request: StartMessageRequest
): Promise<StartMessageResponse> => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    throw new Error("User not authenticated");
  }

  try {
    const response = await apiClient.post("/start-message", request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error starting conversation:", error);
    throw error;
  }
};
