import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    wheelSensitivity: 64,
  },
  reducers: {
    setWheelSensitivity: (state, action: PayloadAction<number>) => {
      state.wheelSensitivity = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setWheelSensitivity } = settingsSlice.actions;

export default settingsSlice.reducer;
