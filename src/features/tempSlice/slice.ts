import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: '',
};

export const tempSlice = createSlice({
    name: 'temp',
    initialState,
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
        },
    },
});

export const { setName } = tempSlice.actions;

export default tempSlice.reducer;
