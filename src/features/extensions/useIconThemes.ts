import { produce } from "immer";
import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { IconTheme } from "../../schemas/iconTheme";
import type { IconThemeDefinition } from "../../schemas/manifest";

type IconThemeId = string;

export interface IconThemeState {
  isActive: boolean;
  definition?: IconThemeDefinition;
  path?: string;
  theme?: IconTheme;
}

export const iconThemeStatesAtom = atom<Record<IconThemeId, IconThemeState>>({});

export function useIconThemes() {
  const [iconThemeStates, setIconThemeStates] = useAtom(iconThemeStatesAtom);

  const activateIconTheme = useCallback(
    (id: IconThemeId) =>
      setIconThemeStates(
        produce((s) => {
          (s[id] ??= { isActive: true }).isActive = true;
        }),
      ),
    [setIconThemeStates],
  );

  const deactivateIconTheme = useCallback(
    (id: IconThemeId) =>
      setIconThemeStates(
        produce((s) => {
          (s[id] ??= { isActive: false }).isActive = false;
        }),
      ),
    [setIconThemeStates],
  );

  const setIconThemeDefinition = useCallback(
    (id: IconThemeId, definition?: IconThemeDefinition) =>
      setIconThemeStates(
        produce((s) => {
          (s[id] ??= { isActive: false }).definition = definition;
        }),
      ),
    [setIconThemeStates],
  );

  const setIconTheme = useCallback(
    (id: IconThemeId, path?: string, theme?: IconTheme) =>
      setIconThemeStates(
        produce((s) => {
          const it = (s[id] ??= { isActive: false });
          it.path = path;
          it.theme = theme;
        }),
      ),
    [setIconThemeStates],
  );

  return {
    iconThemes: iconThemeStates,
    activateIconTheme,
    deactivateIconTheme,
    setIconThemeDefinition,
    setIconTheme,
  };
}
