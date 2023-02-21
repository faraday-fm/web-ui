import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";

type SliceState = {
  wheelSensitivity: number;
};

export const settingsSlice: Slice<SliceState> = createSlice({
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
