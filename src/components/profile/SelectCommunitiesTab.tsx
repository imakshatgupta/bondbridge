import React, { useEffect, useState } from 'react';
import { addCommunity, removeCommunity } from '../../store/createProfileSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import axios from 'axios';

const SelectCommunitiesTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Get all profile data from Redux store
  const {
    name,
    email,
    dateOfBirth,
    password,
    skillSelected,
    image,
    avatar,
    communitiesAvailable,
    communitiesSelected
  } = useAppSelector(state => state.createProfile);

  const isCommunitySelected = (id: number) => {
    return communitiesSelected.some(community => community.id === id);
  };

  // Toggle community selection
  const toggleCommunity = (community: { id: number; name: string; members: number; pfp: string }) => {
    if (isCommunitySelected(community.id)) {
      // If already selected, remove it from selected list
      dispatch(removeCommunity(community));
    } else {
      // If not selected, add it to selected list
      dispatch(addCommunity(community));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const formData = new FormData();
      
      // Validate required fields
      if (!name || !email || !dateOfBirth || !password) {
        throw new Error('Please fill in all required fields');
      }

      // Add basic profile data
      formData.append('name', name);
      formData.append('email', email);
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('password', password);
      
      // Add skills array
      if (skillSelected.length > 0) {
        formData.append('skills', JSON.stringify(skillSelected));
      }
      
      // Add image file if exists
      if (image instanceof File) {
        formData.append('image', image, image.name);
      }
      
      // Add avatar if exists
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      // Add selected communities
      if (communitiesSelected.length > 0) {
        formData.append('communities', JSON.stringify(communitiesSelected));
      }

      // Log formData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await axios.put('http://localhost:3000/api/edit-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'userId': '67cf4290387a5fce47c46d26'
        },
      });
      
      if (response.data.success) {
        console.log("Profile creation successful:", response.data);
        setSubmitSuccess(true);
      } else {
        throw new Error(response.data.message || 'Failed to create profile');
      }
      
    } catch (error) {
      console.error("Profile creation failed:", error);
      if (axios.isAxiosError(error)) {
        setSubmitError(error.response?.data?.message || error.message);
      } else {
        setSubmitError((error as Error).message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    console.log("Selected Communities:", communitiesSelected);
  }, [communitiesSelected]);

  return (
    <div className="">
      <h1 className="text-3xl font-medium mb-1 text-muted-foreground">Let's Join Exciting Communities</h1>
      <p className="text-muted-foreground mb-8">select communities you want to join</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {communitiesAvailable.map((community) => (
          <div 
            key={community.id}
            className={`relative rounded-xl cursor-pointer transition-all ${
              isCommunitySelected(community.id) 
                ? 'bg-purple-50' 
                : 'bg-gray-50'
            }`}
            onClick={() => toggleCommunity(community)}
          >
            {/* Selection Indicator */}
            {isCommunitySelected(community.id) && (
              <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}

            {/* Cover Image */}
            <div className="h-16 w-full rounded-t-xl overflow-hidden">
              <img 
                src={'/profile/community/commbg.png'} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Picture */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                <img 
                  src={community.pfp} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="pt-6 pb-2 px-4 text-center">
              <h3 className={`text-base font-medium ${
                isCommunitySelected(community.id) ? 'text-purple-500' : 'text-gray-900'
              }`}>
                {community.name}
              </h3>
              <p className="text-sm text-gray-400">
                members: {community.members.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Display selected count */}
      {communitiesSelected.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-purple-600 font-medium">
            You've selected {communitiesSelected.length} {communitiesSelected.length === 1 ? 'community' : 'communities'}
          </p>
        </div>
      )}
      
      {/* Submit button with loading state */}
      <div className="flex flex-col items-center mt-8">
        {submitError && (
          <div className="text-red-500 mb-4 text-center">
            {submitError}
          </div>
        )}
        
        {submitSuccess && (
          <div className="text-green-500 mb-4 text-center">
            Profile created successfully!
          </div>
        )}
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md 
            ${isSubmitting 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'border-gray-300 text-gray-700 bg-blue-400 hover:bg-blue-500 cursor-pointer'
            }`}
        >
          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
        </button>
      </div>
    </div>
  );
};

export default SelectCommunitiesTab;