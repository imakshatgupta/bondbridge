import apiClient from "../apiClient";
import { ChatRoomsResponse } from "../apiTypes/response";

export const fetchChatRooms = async (): Promise<ChatRoomsResponse> => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  
  const response = await apiClient.get<ChatRoomsResponse>("/get-all-chat-rooms", {
    headers: {
      token,
      userid: userId,
    },
  });
  return response.data;
};