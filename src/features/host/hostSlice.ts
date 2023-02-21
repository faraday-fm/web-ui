import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { FarMoreHost } from "@types";
import { DummyFarMoreHost } from "../rpc/dummyRpcChannel";

export const hostSlice: Slice<FarMoreHost> = createSlice({
  name: "host",
  initialState: new DummyFarMoreHost() as FarMoreHost,
  reducers: {
    setHost: (_, action: PayloadAction<FarMoreHost>) => {
      return action.payload;
    },
  },
});

export const { setHost } = hostSlice.actions;
