import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  description: "",
  name: "",
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
  image: null as File | null
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
      state.skillsAvailable = state.skillsAvailable.filter((s) => s !== skill);
    },
    removeSkill: (state, action) => {
      const skill = action.payload;
      state.skillsAvailable.push(skill);
      state.skillSelected = state.skillSelected.filter((s) => s !== skill);
    },
    setImage: (state, action) => {
      state.image = action.payload;
    }
  },
});

export const {
  setDescription,
  setName,
  addSkill,
  removeSkill,
  setImage,
} = createGroup.actions;

export default createGroup.reducer;
