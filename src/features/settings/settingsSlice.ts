import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SliceState = {
  wheelSensitivity: number;
};

/** @internal */
export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    wheelSensitivity: 64,
  } as SliceState,
  reducers: {
    setWheelSensitivity: (state, action: PayloadAction<number>) => {
      state.wheelSensitivity = action.payload;
    },
  },
});

export const { setWheelSensitivity } = settingsSlice.actions;
