import apiClient from "../apiClient";
import { GetMessagesRequest } from "../apiTypes/request";
import { GetMessagesResponse } from "../apiTypes/response";

export const getMessages = async (
  data: GetMessagesRequest
): Promise<GetMessagesResponse> => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const response = await apiClient.post<GetMessagesResponse>(
    "/get-all-messages",
    data,
    {
      headers: {
        token,
        userid: userId,
      },
    }
  );
  return response.data;
};
