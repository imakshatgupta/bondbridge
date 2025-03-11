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

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";

// interface Community {
//   id: number;
//   name: string;
//   image: string;
//   members: number;
//   joined: boolean;
// }

// const CommunityList: React.FC = () => {
//   const [communities, setCommunities] = useState<Community[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCommunities = async () => {
//       try {
//         const { data } = await axios.get('http://localhost:3000/api/communities');
//         setCommunities(data);
//       } catch (err: any) {
//         setError(err.response?.data?.message || 'Failed to fetch communities');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCommunities();
//   }, []);

//   const handleJoinToggle = async (id: number, joined: boolean) => {
//     try {
//       await axios.post('http://localhost:3000/api/communities/join', { id, joined: !joined });
//       setCommunities((prev) =>
//         prev.map((community) =>
//           community.id === id ? { ...community, joined: !joined } : community
//         )
//       );
//     } catch (err: any) {
//       alert(err.response?.data?.message || 'Failed to update community status');
//     }
//   };

//   if (loading) return <p className="text-center text-gray-500">Loading communities...</p>;
//   if (error) return <p className="text-center text-red-500">{error}</p>;

//   return (
//     <div className="space-y-4">
//       {communities.map((community) => (
//         <div 
//           key={community.id} 
//           className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
//         >
//           <div className="flex items-center gap-3">
//             <Avatar className="h-12 w-12 rounded-lg">
//               <AvatarImage src={community.image} alt={community.name} className="object-cover" />
//               <AvatarFallback className="rounded-lg">{community.name[0]}</AvatarFallback>
//             </Avatar>
//             <div>
//               <h3 className="font-medium">{community.name}</h3>
//               <p className="text-sm text-muted-foreground">{community.members.toLocaleString()} members</p>
//             </div>
//           </div>
//           <Button 
//             variant={community.joined ? "outline" : "default"}
//             className={community.joined ? "border-primary text-primary" : ""}
//             onClick={() => handleJoinToggle(community.id, community.joined)}
//           >
//             {community.joined ? 'Joined' : 'Join'}
//           </Button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CommunityList;
