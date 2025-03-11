import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Community {
  id: number;
  name: string;
  image: string;
}

const communities: Community[] = [
  { id: 1, name: 'group 1 ', image: '/profile/community/pubg.png' },
  { id: 2, name: 'group 2', image: '/profile/community/pubg.png' },
  { id: 3, name: 'Grupo 3', image: '/profile/community/pubg.png' },
  { id: 4, name: 'beer anyone ?', image: '/profile/community/pubg.png' },
  { id: 5, name: 'Tech Talk', image: '/profile/community/pubg.png' },
  { id: 6, name: 'Design Hub', image: '/profile/community/pubg.png' },
];

const SuggestedCommunities: React.FC = () => {
  return (
    <Carousel
      opts={{
        align: "start",
        // loop: true,
      }}
      
      className="w-full cursor-grab"
    >
      <CarouselContent className=" pl-4 gap-5">
        {communities.map((community) => (
          <CarouselItem key={community.id} className=" basis-[120px] cursor-pointer select-none">
              <div className="h-[180px] w-[120px] rounded-lg mb-2 relative">
                <img 
                  src={"/activity/cat.png"}
                  alt={community.name} 
                  className="object-cover w-full h-full rounded-lg"  
                />
                <div  className='absolute top-1/2 -translate-y-1/2 left-0 w-full h-1/2 backdrop-blur-lg flex flex-col justify-center gap-2 px-3'>
                <Avatar className='w-10 h-10 rounded-full'>
                  <AvatarImage src={community.image} />
                  <AvatarFallback>{community.name[0]}</AvatarFallback>
                </Avatar>
                  {/* intentional white */}
                  <span className='text-white text-sm font-bold truncate'>{community.name}</span>
                </div>

              </div>

          </CarouselItem>
        ))}
        <CarouselItem className="basis-[10px]"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default SuggestedCommunities; 