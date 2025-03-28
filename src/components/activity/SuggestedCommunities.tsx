// import React from 'react';
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
// } from "@/components/ui/carousel";

// interface Community {
//   id: number;
//   name: string;
//   image: string;
// }

// const communities: Community[] = [
//   { id: 1, name: 'group 1 ', image: '/profile/community/pubg.png' },
//   { id: 2, name: 'group 2', image: '/profile/community/pubg.png' },
//   { id: 3, name: 'Grupo 3', image: '/profile/community/pubg.png' },
//   { id: 4, name: 'beer anyone ?', image: '/profile/community/pubg.png' },
//   { id: 5, name: 'Tech Talk', image: '/profile/community/pubg.png' },
//   { id: 6, name: 'Design Hub', image: '/profile/community/pubg.png' },
// ];

// const SuggestedCommunities: React.FC = () => {
//   return (
//     <Carousel
//       opts={{
//         align: "start",
//         // loop: true,
//       }}
      
//       className="w-full cursor-grab"
//     >
//       <CarouselContent className=" pl-4 gap-5">
//         {communities.map((community) => (
//           <CarouselItem key={community.id} className=" basis-[120px] cursor-pointer select-none">
//               <div className="h-[180px] w-[120px] rounded-lg mb-2 relative">
//                 <img 
//                   src={"/activity/cat.png"}
//                   alt={community.name} 
//                   className="object-cover w-full h-full rounded-lg"  
//                 />
//                 <div  className='absolute top-1/2 -translate-y-1/2 left-0 w-full h-1/2 backdrop-blur-lg flex flex-col justify-center gap-2 px-3'>
//                 <Avatar className='w-10 h-10 rounded-full'>
//                   <AvatarImage src={community.image} />
//                   <AvatarFallback>{community.name[0]}</AvatarFallback>
//                 </Avatar>
//                   {/* intentional white */}
//                   <span className='text-white text-sm font-bold truncate'>{community.name}</span>
//                 </div>

//               </div>

//           </CarouselItem>
//         ))}
//         <CarouselItem className="basis-[10px]"></CarouselItem>
//       </CarouselContent>
//     </Carousel>
//   );
// };

// export default SuggestedCommunities; 

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchCommunities } from "@/apis/commonApiCalls/communitiesApi";
import { useApiCall } from "@/apis/globalCatchError";
import { Loader2 } from "lucide-react";
import { CommunityResponse } from '@/apis/apiTypes/response';
import { useNavigate } from 'react-router-dom';

const SuggestedCommunities: React.FC = () => {
  const [executeFetchCommunities, isLoading] = useApiCall(fetchCommunities);
  const [communities, setCommunities] = useState<CommunityResponse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommunities = async () => {
      const { data, success } = await executeFetchCommunities();
      if (success && data) {
        // Get up to 6 communities for the carousel
        setCommunities(data);
      }
    };
    
    loadCommunities();
  }, []);

  const handleCommunityClick = (communityId: string) => {
    navigate(`/community/${communityId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[100px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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