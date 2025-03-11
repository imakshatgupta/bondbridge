import React, { useState } from 'react';

const communities = [
  { id: 1, name: 'Tech Enthusiasts', members: 2450, pfp: '/profile/community/pubg.png' },
  { id: 2, name: 'Creative Arts', members: 1820, pfp: '/profile/community/pubg.png' },
  { id: 3, name: 'Fitness & Health', members: 3100, pfp: '/profile/community/pubg.png' },
  { id: 4, name: 'Book Club', members: 940, pfp: '/profile/community/pubg.png' },
  { id: 5, name: 'Travel Adventurers', members: 2700, pfp: '/profile/community/pubg.png' },
  { id: 6, name: 'Food & Cooking', members: 1560, pfp: '/profile/community/pubg.png' },
];

const SelectCommunitiesTab: React.FC = () => {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);

  const toggleCommunity = (id: number) => {
    setSelectedCommunity(selectedCommunity === id ? null : id);
  };

  return (
    <div className="">
      <h1 className="text-3xl font-medium mb-1 text-foreground">Let's Join Exciting Communities</h1>
      <p className="text-muted-foreground mb-8">select communities you want to join</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {communities.map((community) => (
          <div 
            key={community.id}
            className={`relative rounded-xl cursor-pointer transition-all ${
              selectedCommunity === community.id 
                ? 'bg-accent' 
                : 'bg-muted'
            }`}
            onClick={() => toggleCommunity(community.id)}
          >
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
                selectedCommunity === community.id ? 'text-primary' : 'text-foreground'
              }`}>
                {community.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                members: {community.members.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectCommunitiesTab; 