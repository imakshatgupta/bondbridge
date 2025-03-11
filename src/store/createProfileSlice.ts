import { createSlice } from "@reduxjs/toolkit";

interface Community {
  id: number;
  name: string;
  members: number;
  pfp: string;
}

const initialState = {
  name: "",
  email: "",
  dateOfBirth: "",
  password: "",
  skillsAvailable: [
    "NEWS",
    "Music",
    "Sports",
    "Racing cars",
    "Marketing",
    "Science",  
    "Chess",
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
};

export const createProfile = createSlice({
  name: "createProfile",
  initialState,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setDateOfBirth: (state, action) => {
      state.dateOfBirth = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    addSkill: (state, action) => {
      const skill = action.payload;
      state.skillSelected.push(skill);
      state.skillsAvailable = state.skillsAvailable.filter((s) => s !== skill);
    },
    removeSkill: (state, action) => {
      const skill = action.payload;
      state.skillsAvailable.push(skill);
      state.skillSelected = state.skillSelected.filter((s) => s !== skill);
    },
    setAvatar: (state, action) => {
      state.avatar = action.payload;
    },
    setImage: (state, action) => {
      state.image = action.payload;
    },
    setCommunitiesSelected: (state, action) => {
      state.communitiesSelected = action.payload;
    },
    addCommunity: (state, action) => {
      const community = action.payload;
      if (!state.communitiesSelected.some((c) => c.id === community.id)) {
        state.communitiesSelected.push(community);
      }
    },
    removeCommunity: (state, action) => {
      const communityId = action.payload.id;
      state.communitiesSelected = state.communitiesSelected.filter(
        (c) => c.id !== communityId
      );
    },
  },
});

export const {
  setName,
  setEmail,
  setDateOfBirth,
  setPassword,
  addSkill,
  removeSkill,
  setAvatar,
  setImage,
  setCommunitiesSelected,
  addCommunity,
  removeCommunity,
} = createProfile.actions;

export default createProfile.reducer;
