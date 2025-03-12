import axios from 'axios';
// Use import.meta.env for Vite or directly use the URL
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = (userId?: string) => {
  return {
    'Content-Type': 'multipart/form-data',
    'token': localStorage.getItem('token') || '',
    'userId': userId || '',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };
};

// Interface for profile data matching our Redux store
interface ProfileData {
  userId?: string;
  name: string;
  email: string;
  dateOfBirth: string;
  password: string;
  skillSelected: string[];
  image?: File;
  avatar?: string;
  communitiesSelected?: {
    id: number;
    name: string;
    members: number;
    pfp: string;
  }[];
}

// Function to submit the complete profile
export const submitProfile = async (profileData: ProfileData) => {
  const { 
    userId, 
    name, 
    email, 
    dateOfBirth, 
    password, 
    skillSelected, 
    //image,  // uncomment when image is added
    avatar, 
    //communitiesSelected  // uncomment when communities are added
  } = profileData;
  
  // Validate required fields
  if (!name || !email || !dateOfBirth || !password) {
    throw new Error('Please fill in all required fields');
  }
  
  // Create FormData object
  const formData = new FormData();
  
  // Add basic profile data
  formData.append('name', name);
  formData.append('email', email);
  
  // commented out for now as we are not using dateOfBirth and password
  // formData.append('dateOfBirth', dateOfBirth);
  // formData.append('password', password);
  
  // Add skills array
  if (skillSelected && skillSelected.length > 0) {
    formData.append('interests', JSON.stringify(skillSelected));
  }
  
  // commented out for now as we are not using image
  // Add image file if exists
  // if (image instanceof File) {
  //   formData.append('image', image, image.name);
  // }
  
  // Add avatar if exists
  if (avatar) {
    formData.append('avatar', avatar);
  }
  
  // commented out for now as we are not using communities
  // Add selected communities
  // if (communitiesSelected && communitiesSelected.length > 0) {
  //   formData.append('communities', JSON.stringify(communitiesSelected.map(c => c.id)));
  // }
  
  // Log formData contents for debugging
  // for (const pair of formData.entries()) {
  //   console.log(pair[0] + ': ' + pair[1]);
  // }
  
  const headers = getAuthHeaders(userId);
  
  const response = await axios.put(`${API_BASE_URL}/edit-profile`, formData, {
    headers,
  });
  
  if (response.status === 200) {
    console.log("Profile creation successful:", response.data);
    return response.data;
  } else {
    // console.log(response.data.message);
    throw new Error(response.data.message || 'Failed to create profile');
  }
};

// Function to fetch avatars
export const fetchAvatars = async (userId?: string) => {
  const headers = getAuthHeaders(userId);
  
  const response = await axios.get(`${API_BASE_URL}/get-avatars`, {
    headers
  });
  
  if (response.data && response.data.success) {
    return {
      maleAvatars: response.data.URLS.male || [],
      femaleAvatars: response.data.URLS.female || []
    };
  } else {
    throw new Error(response.data.message || 'Failed to fetch avatars');
  }
};