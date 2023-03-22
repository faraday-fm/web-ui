import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SliceState = {
  wheelSensitivity: number;
  iconThemeId: string;
};

/** @internal */
export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    wheelSensitivity: 64,
    iconThemeId: "",
  } as SliceState,
  reducers: {
    setWheelSensitivity: (state, { payload }: PayloadAction<number>) => {
      state.wheelSensitivity = payload;
    },
    setIconThemeId: (state, { payload }: PayloadAction<string>) => {
      state.iconThemeId = payload;
    },
  },
});

export const { setWheelSensitivity, setIconThemeId } = settingsSlice.actions;
