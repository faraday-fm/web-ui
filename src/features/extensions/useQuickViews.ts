import { produce } from "immer";
import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { QuickViewDefinition } from "../../schemas/manifest";

type QuickViewId = string;

export interface QuickViewState {
  isActive: boolean;
  definition?: QuickViewDefinition;
  path?: string;
  script?: string;
}

export const quickViewStatesAtom = atom<Record<QuickViewId, QuickViewState>>({});

export function useQuickViews() {
  const [quickViewStates, setQuickViewStates] = useAtom(quickViewStatesAtom);

  const activateQuickView = useCallback(
    (id: QuickViewId) =>
      setQuickViewStates(
        produce((state) => {
          (state[id] ??= { isActive: true }).isActive = true;
        }),
      ),
    [setQuickViewStates],
  );
  const deactivateQuickView = useCallback(
    (id: QuickViewId) =>
      setQuickViewStates(
        produce((state) => {
          (state[id] ??= { isActive: false }).isActive = false;
        }),
      ),
    [setQuickViewStates],
  );
  const setQuickViewDefinition = useCallback(
    (id: QuickViewId, definition?: QuickViewDefinition) =>
      setQuickViewStates(
        produce((state) => {
          (state[id] ??= { isActive: false }).definition = definition;
        }),
      ),
    [setQuickViewStates],
  );
  const setQuickViewScript = useCallback(
    (id: QuickViewId, path?: string, script?: string) =>
      setQuickViewStates(
        produce((state) => {
          const qv = (state[id] ??= { isActive: false });
          qv.path = path;
          qv.script = script;
        }),
      ),
    [setQuickViewStates],
  );

  return {
    quickViews: quickViewStates,
    activateQuickView,
    deactivateQuickView,
    setQuickViewDefinition,
    setQuickViewScript,
  };
}
