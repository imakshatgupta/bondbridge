import { createSlice } from "@reduxjs/toolkit";
import { AVAILABLE_INTERESTS } from "@/lib/constants";

// Define the Friend interface
interface Friend {
  _id: string;
  name: string;
  profilePic: string;
  bio?: string;
  followers?: number;
  followings?: number;
}

// Update the initial state to include selectedFriends
const initialState = {
  description: "",
  name: "",
  skillsAvailable: [...AVAILABLE_INTERESTS],
  skillSelected: [] as string[],
  image: null as File | null,
  selectedFriends: [] as Friend[],
};

export const createGroup = createSlice({
  name: "createGroup",
  initialState,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    addSkill: (state, action) => {
      const skill = action.payload;
      state.skillSelected.push(skill);
    },
    removeSkill: (state, action) => {
      const skill = action.payload;
      state.skillSelected = state.skillSelected.filter((s) => s !== skill);
    },
    setImage: (state, action) => {
      state.image = action.payload;
    },
    // Add new reducers for managing selected friends
    addFriend: (state, action) => {
      const friend = action.payload;
      // Check if the friend is already selected
      if (!state.selectedFriends.some(f => f._id === friend._id)) {
        state.selectedFriends.push(friend);
      }
    },
    removeFriend: (state, action) => {
      const friendId = action.payload;
      state.selectedFriends = state.selectedFriends.filter(friend => friend._id !== friendId);
    },
    resetGroupState: () => {
      return initialState;
    }
  },
});

export const {
  setDescription,
  setName,
  addSkill,
  removeSkill,
  setImage,
  addFriend,
  removeFriend,
  resetGroupState,
} = createGroup.actions;

export default createGroup.reducer;