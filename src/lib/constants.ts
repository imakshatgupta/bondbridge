export const TYPING_TIME = 2000;
export interface Community {
  id: number;
  name: string;
  members: number;
  pfp: string;
}

export const INITIAL_PROFILE_STATE = {
  name: "",
  email: "",
  dateOfBirth: "",
  password: "",
  skillsAvailable: [
    "News",
    "Music",
    "Sports",
    "Racing cars",
    "Marketing",
    "Science",  
    "Chess",
    "Gaming",
    "Anime",
    "Food",
    "Travel",
    "Art",
    "Writing",
  ],
  skillSelected: [] as string[],
  image: null as File | null,
  avatar: null as string | null,
  communitiesAvailable: [
    {
      id: 1,
      name: "Tech Enthusiasts",
      members: 2450,
      pfp: "/profile/community/pubg.png",
    },
    {
      id: 2,
      name: "Creative Arts",
      members: 1820,
      pfp: "/profile/community/pubg.png",
    },
    {
      id: 3,
      name: "Fitness & Health",
      members: 3100,
      pfp: "/profile/community/pubg.png",
    },
    {
      id: 4,
      name: "Book Club",
      members: 940,
      pfp: "/profile/community/pubg.png",
    },
    {
      id: 5,
      name: "Travel Adventurers",
      members: 2700,
      pfp: "/profile/community/pubg.png",
    },
    {
      id: 6,
      name: "Food & Cooking",
      members: 1560,
      pfp: "/profile/community/pubg.png",
    },
  ] as Community[],
  communitiesSelected: [] as Community[],
} as const;

export const GET_AUTH_HEADERS = () => ({
  'token': localStorage.getItem('token') || '',
  'userId': localStorage.getItem('userId') || '',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});


