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
  try {
    const response = await apiClient.post("/get-all-messages", request);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const startMessage = async (
  request: StartMessageRequest
): Promise<StartMessageResponse> => {
  try {
    const response = await apiClient.post("/start-message", request);
    return response.data;
  } catch (error) {
    console.error("Error starting conversation:", error);
    throw error;
  }
};
