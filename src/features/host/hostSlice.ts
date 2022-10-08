import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FarMoreHost } from "~/src/types";
import { DummyFarMoreHost } from "../rpc/dummyRpcChannel";

export const hostSlice = createSlice({
  name: "host",
  initialState: new DummyFarMoreHost() as FarMoreHost,
  reducers: {
    setHost: (_, action: PayloadAction<FarMoreHost>) => {
      return action.payload;
    },
  },
});

export const { setHost } = hostSlice.actions;
