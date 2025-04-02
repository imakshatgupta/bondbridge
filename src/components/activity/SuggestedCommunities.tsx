import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CommunityResponse } from '@/apis/apiTypes/response';
import { useNavigate } from 'react-router-dom';

interface SuggestedCommunitiesProps {
  communities: CommunityResponse[];
}

const SuggestedCommunities: React.FC<SuggestedCommunitiesProps> = ({ communities }) => {
  const navigate = useNavigate();

  const handleCommunityClick = (communityId: string) => {
    navigate(`/community/${communityId}`);
  };

  // No internal loading state anymore
  return (
    <div className="pl-4 gap-5 overflow-x-auto flex cursor-auto scrollbar-none">
      {communities.map((community) => (
        <div 
          key={community._id} 
          className="basis-[120px] cursor-pointer select-none"
          onClick={() => handleCommunityClick(community._id)}
        >
          <div className="h-[180px] w-[120px] rounded-lg mb-2 relative overflow-hidden group">
            <img 
              src={community.backgroundImage || "/activity/cat.png"}
              alt={community.name} 
              className="object-cover w-full h-full rounded-lg group-hover:scale-105 transition-transform duration-300"  
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1/2 backdrop-blur-lg flex flex-col justify-center gap-2 px-3">
              <Avatar className='w-10 h-10 rounded-full border-2 border-white/50'>
                <AvatarImage src={community.profilePicture || "/profile/default-avatar.png"} />
                <AvatarFallback>{community.name[0]}</AvatarFallback>
              </Avatar>
              <span className='text-white text-sm font-bold truncate'>{community.name}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="basis-[10px]"></div>
    </div>
  );
};

export default SuggestedCommunities;