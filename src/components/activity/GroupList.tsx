import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Group {
  id: number;
  name: string;
  image: string;
  members: number;
  lastActive: string;
}

const groups: Group[] = [
  {
    id: 1,
    name: 'Design Team',
    image: '/profile/community/pubg.png',
    members: 12,
    lastActive: '5m ago'
  },
  {
    id: 2,
    name: 'Project Alpha',
    image: '/profile/community/pubg.png',
    members: 8,
    lastActive: '1h ago'
  },
  {
    id: 3,
    name: 'Weekend Hangout',
    image: '/profile/community/pubg.png',
    members: 6,
    lastActive: '3h ago'
  }
];

const GroupList: React.FC = () => {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div 
          key={group.id} 
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={group.image} alt={group.name} className="object-cover" />
              <AvatarFallback className="rounded-lg">{group.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.members} members</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{group.lastActive}</span>
        </div>
      ))}
    </div>
  );
};

export default GroupList; 