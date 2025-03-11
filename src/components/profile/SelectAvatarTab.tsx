import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAvatar } from '../redux/../../store/createProfileSlice';

const SelectAvatarTab = () => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Fetch avatars from backend
    const fetchAvatars = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/get-avatars'); // Adjust the API endpoint as needed
        setAvatars(response.data);
        console.log("Avatars:", response.data);
        // Set the first avatar as default selected if available
        if (response.data.length > 0) {
          setSelectedAvatar(response.data[0].id);
          // Store the default avatar in Redux
          dispatch(setAvatar(response.data[0].url));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load avatars. Please try again later.');
        setLoading(false);
        console.error('Error fetching avatars:', err);
      }
    };
    
    fetchAvatars();
  }, [dispatch]);
  
  const handleAvatarSelect = (avatarId, avatarUrl) => {
    setSelectedAvatar(avatarId);
    // Dispatch the selected avatar URL to Redux store
    dispatch(setAvatar(avatarUrl));
  };
  
  if (loading) {
    return <div className="flex justify-center py-8"><span className="loading loading-spinner loading-md"></span></div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-700">Choose an avatar that represents you</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {avatars.map((avatar) => (
          <div 
            key={avatar.id}
            className={`relative cursor-pointer rounded-lg border-2 ${
              selectedAvatar === avatar.id 
                ? 'border-primary bg-muted' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleAvatarSelect(avatar.id, avatar.url)}
          >
            <img 
              src={avatar.url} 
              alt={`Avatar ${avatar.id}`}
              className="h-full w-full mx-auto object-cover rounded-lg"
            />
            {selectedAvatar === avatar.id && (
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectAvatarTab;