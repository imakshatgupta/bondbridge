import { adminApiClient } from '../apiClient';
import { CommunitiesResponse, CommunityResponse, CommunityJoinRequest } from '../apiTypes/communitiesTypes';

// Function to fetch all communities
export const fetchCommunities = async (): Promise<CommunityResponse[]> => {
  const response = await adminApiClient.get<CommunitiesResponse>(
    '/communities'
  );
  return response.data.communities;
};

// Function to fetch communities where the current user is a member
export const fetchUserCommunities = async (): Promise<CommunityResponse[]> => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const communities = await fetchCommunities();
  
  // Filter communities where the user is a member
  return communities.filter(community => 
    community.members && community.members.includes(userId)
  );
};

// Function to join or leave a community or multiple communities
export const joinCommunity = async (params: CommunityJoinRequest): Promise<{ success: boolean; message?: string }> => {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await adminApiClient.post(
    '/users/joincommunity',
    {
      communityIds: params.communityIds,
      userId: userId,
      action: params.action
    }
  );
  
  return {
    success: response.status === 200,
    message: response.data.message
  };
};

// Function to join multiple communities at once
export const joinMultipleCommunities = async (communityIds: string[]): Promise<{ success: boolean; message?: string }> => {
  const userId = localStorage.getItem('userId');
  if(!userId) {
    throw new Error('User not authenticated');
  }
  return joinCommunity({
    communityIds: communityIds,
    userId,
    action: 'join'
  });
};

// Function to fetch a specific community by ID
export const fetchCommunityById = async (communityId: string): Promise<CommunityResponse> => {
  const response = await adminApiClient.get<CommunityResponse>(
    `/communities/${communityId}`
  );
  
  return response.data;
};