import React, { useEffect } from 'react';
import { addCommunity, removeCommunity } from '../../store/createProfileSlice';
import { useAppDispatch, useAppSelector } from '../../store';

const SelectCommunitiesTab: React.FC = () => {
  const dispatch = useAppDispatch();  
  // Get all profile data from Redux store
  const {
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
    </div>
  );
};

export default SelectCommunitiesTab;