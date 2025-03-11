import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Community {
  id: number;
  name: string;
  image: string;
  members: number;
  joined: boolean;
}

const communities: Community[] = [
  {
    id: 1,
    name: 'Tech Enthusiasts',
    image: '/profile/community/pubg.png',
    members: 2450,
    joined: true
  },
  {
    id: 2,
    name: 'Creative Arts',
    image: '/profile/community/pubg.png',
    members: 1820,
    joined: false
  },
  {
    id: 3,
    name: 'Fitness & Health',
    image: '/profile/community/pubg.png',
    members: 3100,
    joined: false
  }
];

const CommunityList: React.FC = () => {
  return (
    <div className="space-y-4">
      {communities.map((community) => (
        <div 
          key={community.id} 
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={community.image} alt={community.name} className="object-cover" />
              <AvatarFallback className="rounded-lg">{community.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{community.name}</h3>
              <p className="text-sm text-muted-foreground">{community.members.toLocaleString()} members</p>
            </div>
          </div>
          <Button 
            variant={community.joined ? "outline" : "default"}
            className={community.joined ? "border-primary text-primary" : ""}
          >
            {community.joined ? 'Joined' : 'Join'}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default CommunityList; 