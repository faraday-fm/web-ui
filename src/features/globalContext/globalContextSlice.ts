import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SliceState = {
  selectedFilePath?: string;
};

/** @internal */
export const globalContextSlice = createSlice({
  name: "panels",
  initialState: {
    states: {},
  } as SliceState,
  reducers: {
    setSelectedFilePath(state, { payload }: PayloadAction<string>) {
      state.selectedFilePath = payload;
    },
  },
});

export const { setSelectedFilePath } = globalContextSlice.actions;
