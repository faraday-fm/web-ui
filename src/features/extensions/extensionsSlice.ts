import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuickView } from "@schemas/manifest";

type ExtId = string;
type QuickViewId = string;

export type QuickViews = Record<ExtId, Record<QuickViewId, { quickView: QuickView; script: string }>>;

type SliceState = {
  quickViews: QuickViews;
};

/** @internal */
export const extensionsSlice = createSlice({
  name: "extensions",
  initialState: { quickViews: {}, quickViewsByExtension: {}, quickViewsByFileName: {}, quickViewsByMimetype: {} } as SliceState,
  reducers: {
    addQuickView(state, { payload: { extId, quickView, script } }: PayloadAction<{ extId: ExtId; quickView: QuickView; script: string }>) {
      (state.quickViews[extId] ??= {})[quickView.id] = { quickView, script };
    },
    deleteQuickView(state, { payload: { extId, quickViewId } }: PayloadAction<{ extId: ExtId; quickViewId: QuickViewId }>) {
      const quickViews = state.quickViews[extId];
      if (quickViews) {
        delete state.quickViews[extId]?.[quickViewId];
        if (Object.keys(quickViews).length === 0) {
          delete state.quickViews[extId];
        }
      }
    },
  },
});

export const { addQuickView, deleteQuickView } = extensionsSlice.actions;
