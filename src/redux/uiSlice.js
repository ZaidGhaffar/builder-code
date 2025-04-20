import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isModalOpen: false, // Ensure this is initialized
  },
  reducers: {
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
  },
});

export const { toggleModal } = uiSlice.actions;
export default uiSlice.reducer;