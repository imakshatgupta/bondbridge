import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_PROFILE_STATE, AVAILABLE_INTERESTS } from "@/lib/constants";

export const createProfile = createSlice({
  name: "createProfile",
  initialState: {
    ...INITIAL_PROFILE_STATE,
    skillsAvailable: [...AVAILABLE_INTERESTS],
    skillSelected: [...INITIAL_PROFILE_STATE.skillSelected],
    communitiesSelected: [...INITIAL_PROFILE_STATE.communitiesSelected],
    communitiesAvailable: [...INITIAL_PROFILE_STATE.communitiesAvailable],
  },
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
