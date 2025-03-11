import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import axios from 'axios';
import { setAvatar } from '@/store/createProfileSlice';

interface AvatarData {
  url: string;
  type: string;
}

const SelectAvatarTab: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [maleAvatars, setMaleAvatars] = useState<AvatarData[]>([]);
  const [femaleAvatars, setFemaleAvatars] = useState<AvatarData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { userId, avatar } = useAppSelector(state => state.createProfile);
  const dispatch = useAppDispatch();

  // Update Redux store when avatar is selected
  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    dispatch(setAvatar(avatarUrl));
  };

  // Initialize selected avatar from Redux state if available
  useEffect(() => {
    if (avatar) {
      setSelectedAvatar(avatar);
    }
  }, [avatar]);

  useEffect(() => {
    const fetchAvatars = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/get-avatars', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'token': localStorage.getItem('token'),
            'userId': userId || ''
          }
        });
        
        // Process the response data
        if (response.data && response.data.success) {
          if (response.data.URLS.male) {
            setMaleAvatars(response.data.URLS.male);
          }
          if (response.data.URLS.female) {
            setFemaleAvatars(response.data.URLS.female);
          }
          
          // If no avatar is selected yet but we have avatars, select the first one
          if (!selectedAvatar && !avatar) {
            const firstAvatar = response.data.URLS.male?.[0]?.url || response.data.URLS.female?.[0]?.url;
            if (firstAvatar) {
              handleAvatarSelect(firstAvatar);
            }
          }
        }

      } catch (error) {
        console.error('Error fetching avatars:', error);
        // Fallback to default avatars if API fails
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAvatars();
    } else {
      // Fallback to default avatars if no userId
      setMaleAvatars([1,2,3,4].map(id => ({ url: `/profile/avatars/male${id}.png`, type: 'image' })));
      setFemaleAvatars([1,2,3,4].map(id => ({ url: `/profile/avatars/female${id}.png`, type: 'image' })));
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-700">Choose an avatar that represents you</p>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {/* Female Avatars Section */}
          {femaleAvatars.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Female Avatars</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {femaleAvatars.map((avatar, index) => (
                  <div 
                    key={`female-${index}`}
                    className={`relative cursor-pointer rounded-lg border-2 ${
                      selectedAvatar === avatar.url 
                        ? 'border-primary bg-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAvatarSelect(avatar.url)}
                  >
                    <img 
                      src={avatar.url} 
                      alt={`Female Avatar ${index + 1}`}
                      className="h-full w-full mx-auto object-cover rounded-lg"
                    />
                    {selectedAvatar === avatar.url && (
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
          )}

          {/* Male Avatars Section */}
          {maleAvatars.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Male Avatars</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {maleAvatars.map((avatar, index) => (
                  <div 
                    key={`male-${index}`}
                    className={`relative cursor-pointer rounded-lg border-2 ${
                      selectedAvatar === avatar.url 
                        ? 'border-primary bg-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAvatarSelect(avatar.url)}
                  >
                    <img 
                      src={avatar.url} 
                      alt={`Male Avatar ${index + 1}`}
                      className="h-full w-full mx-auto object-cover rounded-lg"
                    />
                    {selectedAvatar === avatar.url && (
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
          )}

          {/* No avatars message */}
          {maleAvatars.length === 0 && femaleAvatars.length === 0 && (
            <p className="text-center text-gray-500">No avatars available</p>
          )}
        </>
      )}
    </div>
  );
};

export default SelectAvatarTab;