import apiClient from "../apiClient";
import { GetMessagesRequest } from "../apiTypes/request";
import {
  GetMessagesResponse,
  StartMessageResponse,
  RandomTextResponse,
} from "../apiTypes/response";
import { StartMessageRequest } from "../apiTypes/request";

export const getMessages = async (
  request: GetMessagesRequest
): Promise<GetMessagesResponse> => {
  const response = await apiClient.post("/get-all-messages", request);
  return response.data;
};

export const startMessage = async (
  request: StartMessageRequest
): Promise<StartMessageResponse> => {
  const response = await apiClient.post("/start-message", request);
  return response.data;
};

export const getRandomText = async (
  otherId?: string
): Promise<RandomTextResponse> => {
  const url = otherId ? `/getRandomText?other=${otherId}` : "/getRandomText";
  const response = await apiClient.get(url);
  return response.data;
};
