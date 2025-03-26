import axios from 'axios';
import { CommunitiesResponse, CommunityResponse } from '../apiTypes/response';

// Function to fetch all communities
export const fetchCommunities = async (): Promise<CommunityResponse[]> => {
  const response = await axios.get<CommunitiesResponse>(
    'https://bond-bridge-admin-dashboard.vercel.app/api/communities',
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
  return response.data.communities;
};

// Function to join or leave a community
// export const joinCommunity = async (params: {
//   communityId: string;
//   userId: string;
//   action: 'join' | 'remove';
// }): Promise<{ success: boolean; message?: string }> => {
//   const token = localStorage.getItem('token');
//   const userId = localStorage.getItem('userId');

//   if (!token || !userId) {
//     throw new Error('Authentication required');
//   }

//   const response = await axios.post(
//     'https://bond-bridge-admin-dashboard.vercel.app/api/users/joincommunity',
//     {
//       communityId: params.communityId,
//       userId: params.userId,
//       action: params.action
//     },
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'userId': userId,
//         'token': token
//       }
//     }
//   );
  
//   return {
//     success: response.status === 200,
//     message: response.data.message
//   };
// };

// // Function to join multiple communities at once
// export const joinMultipleCommunities = async (communityIds: string[]): Promise<{ success: boolean; message?: string }> => {
//   const token = localStorage.getItem('token');
//   const userId = localStorage.getItem('userId');

//   if (!token || !userId) {
//     throw new Error('Authentication required');
//   }

//   // Join each community one by one
//   const joinPromises = communityIds.map(communityId => 
//     joinCommunity({
//       communityId,
//       userId,
//       action: 'join'
//     })
//   );
  
//   await Promise.all(joinPromises);
  
//   return {
//     success: true,
//     message: 'Successfully joined all communities'
//   };
// };