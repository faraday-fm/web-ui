import { produce } from "immer";
import { atom, useSetAtom } from "jotai";
import { useMemo } from "react";
import type { ExtensionManifest } from "../../schemas/manifest";

type ExtId = string;

export interface ExtensionState {
  isActive: boolean;
  manifest?: ExtensionManifest;
}

export const extensionStatesAtom = atom<Record<ExtId, ExtensionState>>({});

export function useExtensionStates() {
  const setExtensionStates = useSetAtom(extensionStatesAtom);
  return useMemo(
    () => ({
      setExtensionManifest: (extId: string, manifest?: ExtensionManifest) => {
        setExtensionStates(
          produce((s) => {
            (s[extId] ??= { isActive: false }).manifest = manifest;
          }),
        );
      },
      activateExtension: (extId: string) => {
        setExtensionStates(
          produce((s) => {
            (s[extId] ??= { isActive: true }).isActive = true;
          }),
        );
      },
      deactivateExtension: (extId: string) => {
        setExtensionStates(
          produce((s) => {
            (s[extId] ??= { isActive: false }).isActive = false;
          }),
        );
      },
    }),
    [setExtensionStates],
  );
}
