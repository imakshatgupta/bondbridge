import apiClient, { formDataApiClient } from '@/apis/apiClient';
import { CreateProfileRequest } from '@/apis/apiTypes/request';
import { CreateProfileResponse, FetchAvatarsResponse } from '@/apis/apiTypes/response';
import { AvatarUrls } from '@/apis/apiTypes/response';

// Function to submit the complete profile
export const submitProfile = async (profileData: CreateProfileRequest): Promise<CreateProfileResponse> => {
  const { 
    name, 
    email, 
    dateOfBirth, 
    password, 
    skillSelected, 
    avatar,
    image,
    // communities
  } = profileData;
  
  // Validate required fields
  if (!name || !email || !dateOfBirth || !password) {
    throw new Error('Please fill in all required fields');
  }
  
  const formData = new FormData();
  
  formData.append('name', name);
  formData.append('email', email);

  // commented out as not being uploaded currently
  formData.append('dob', dateOfBirth);

  if (skillSelected && skillSelected.length > 0) {
    formData.append('interests', JSON.stringify(skillSelected));
  }
  
  // commented out as not being uploaded currently
  if (image) {
    formData.append('profilePic', image);
  }

  if (avatar) {
    formData.append('avatar', avatar);
  }
  
  // commented out as not being uploaded currently
  // if (communities && communities.length > 0) {
  //   formData.append('communities', JSON.stringify(communities));
  // }

  const response = await formDataApiClient.put<CreateProfileResponse>(
    `/edit-profile`,
    formData
  );
  
  if (response.status === 200) {
    console.log("Profile creation successful:", response.data);
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to create profile');
  }
};

// Function to fetch avatars
export const fetchAvatars = async (): Promise<AvatarUrls> => {
  const response = await apiClient.get<FetchAvatarsResponse>(
    `/get-avatars`
  );
  
  if (response.data && response.data.success) {
    return {
      male: response.data?.URLS.male || [],
      female: response.data?.URLS.female || []
    };
  } else {
    throw new Error(response.data.message || 'Failed to fetch avatars');
  }
};