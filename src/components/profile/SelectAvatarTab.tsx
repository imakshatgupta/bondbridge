import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setAvatar } from '@/store/createProfileSlice';
import { useApiCall } from '@/apis/globalCatchError';
import { fetchAvatars } from '@/apis/commonApiCalls/createProfileApi';

interface AvatarData {
  url: string;
  type: string;
}

const SelectAvatarTab: React.FC = () => {
  const [, setLoading] = useState<boolean>(true);
  const [maleAvatars, setMaleAvatars] = useState<AvatarData[]>([]);
  const [femaleAvatars, setFemaleAvatars] = useState<AvatarData[]>([]);
  const { userId, avatar } = useAppSelector(state => state.createProfile);
  const dispatch = useAppDispatch();

  // Use our custom hook for API calls
  const [executeFetchAvatars, isLoadingAvatars] = useApiCall(fetchAvatars);

  // Update Redux store when avatar is selected
  const handleAvatarSelect = (avatarUrl: string) => {
    dispatch(setAvatar(avatarUrl));
  };

  useEffect(() => {
    const getAvatars = async () => {
      console.log('Fetching avatars with userId:', userId);
      
      const result = await executeFetchAvatars(userId);
      
      if (result.success && result.data) {
        const { maleAvatars: male, femaleAvatars: female } = result.data;
        
        if (male && male.length > 0) {
          setMaleAvatars(male);
        }
        
        if (female && female.length > 0) {
          setFemaleAvatars(female);
        }
        
        // If no avatar is selected yet but we have avatars, select the first one
        if (!avatar) {
          const firstAvatar = male[0]?.url || female[0]?.url;
          if (firstAvatar) {
            handleAvatarSelect(firstAvatar);
          }
        }
      }
      
      setLoading(false);
    };

    // Only try to fetch avatars if userId exists
    if (userId) {
      getAvatars();
    }
  }, []);

  // Use isLoadingAvatars instead of the local loading state
  const loading = isLoadingAvatars;

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
                {femaleAvatars.map((avatarItem, index) => (
                  <div 
                    key={`female-${index}`}
                    className={`relative cursor-pointer rounded-lg border-2 ${
                      avatar === avatarItem.url 
                        ? 'border-primary bg-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAvatarSelect(avatarItem.url)}
                  >
                    <img 
                      src={avatarItem.url} 
                      alt={`Female Avatar ${index + 1}`}
                      className="h-full w-full mx-auto object-cover rounded-lg"
                    />
                    {avatar === avatarItem.url && (
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
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
                {maleAvatars.map((avatarItem, index) => (
                  <div 
                    key={`male-${index}`}
                    className={`relative cursor-pointer rounded-lg border-2 ${
                      avatar === avatarItem.url 
                        ? 'border-primary bg-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAvatarSelect(avatarItem.url)}
                  >
                    <img 
                      src={avatarItem.url} 
                      alt={`Male Avatar ${index + 1}`}
                      className="h-full w-full mx-auto object-cover rounded-lg"
                    />
                    {avatar === avatarItem.url && (
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