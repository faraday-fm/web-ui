import { QuickView } from "@schemas/manifest";
import { ImmerStateCreator } from "@utils/immer";

type ExtId = string;
type QuickViewId = string;

export type QuickViews = Record<ExtId, Record<QuickViewId, { quickView: QuickView; script: string }>>;

interface State {
  quickViews: QuickViews;
  quickViewsByExtension: QuickViews;
  quickViewsByFileName: QuickViews;
  quickViewsByMimetype: QuickViews;
}

interface Actions {
  addQuickView(extId: ExtId, quickView: QuickView, script: string): void;
  deleteQuickView(extId: ExtId, quickViewId: QuickViewId): void;
}

export type ExtensionsSlice = State & Actions;

/** @internal */
export const createExtensionsSlice: ImmerStateCreator<ExtensionsSlice> = (set) => ({
  quickViews: {},
  quickViewsByExtension: {},
  quickViewsByFileName: {},
  quickViewsByMimetype: {},
  addQuickView: (extId, quickView, script) =>
    set((state) => {
      (state.quickViews[extId] ??= {})[quickView.id] = { quickView, script };
    }),
  deleteQuickView: (extId, quickViewId) =>
    set((state) => {
      const quickViews = state.quickViews[extId];
      if (quickViews) {
        delete state.quickViews[extId]?.[quickViewId];
        if (Object.keys(quickViews).length === 0) {
          delete state.quickViews[extId];
        }
      }
    }),
});
