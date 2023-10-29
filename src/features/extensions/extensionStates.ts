import { IconTheme } from "../../schemas/iconTheme";
import { ExtensionManifest, IconThemeDefinition, QuickViewDefinition } from "../../schemas/manifest";
import { ImmerStateCreator } from "../../utils/immer";

type ExtId = string;
type QuickViewId = string;
type IconThemeId = string;

export interface ExtensionState {
  isActive: boolean;
  manifest?: ExtensionManifest;
}

export interface QuickViewState {
  isActive: boolean;
  definition?: QuickViewDefinition;
  path?: string;
  script?: string;
}

export interface IconThemeState {
  isActive: boolean;
  definition?: IconThemeDefinition;
  path?: string;
  theme?: IconTheme;
}

interface State {
  extensions: Record<ExtId, ExtensionState>;
  quickViews: Record<QuickViewId, QuickViewState>;
  iconThemes: Record<IconThemeId, IconThemeState>;
}

interface Actions {
  activateExtension(id: ExtId): void;
  deactivateExtension(id: ExtId): void;
  setExtensionManifest(id: ExtId, manifest?: ExtensionManifest): void;

  activateQuickView(id: QuickViewId): void;
  deactivateQuickView(id: QuickViewId): void;
  setQuickViewDefinition(id: QuickViewId, definition?: QuickViewDefinition): void;
  setQuickViewScript(id: QuickViewId, path?: string, script?: string): void;

  activateIconTheme(id: IconThemeId): void;
  deactivateIconTheme(id: IconThemeId): void;
  setIconThemeDefinition(id: QuickViewId, definition?: IconThemeDefinition): void;
  setIconTheme(id: IconThemeId, path?: string, theme?: IconTheme): void;
}

export type ExtensionStatesSlice = State & Actions;

export const createExtensionStatesSlice: ImmerStateCreator<ExtensionStatesSlice> = (set) => ({
  extensions: {},
  quickViews: {},
  iconThemes: {},
  activateExtension: (id) =>
    set((state) => {
      (state.extensions[id] ??= { isActive: true }).isActive = true;
    }),
  deactivateExtension: (id) =>
    set((state) => {
      (state.extensions[id] ??= { isActive: false }).isActive = false;
    }),
  setExtensionManifest: (id, manifest) =>
    set((state) => {
      (state.extensions[id] ??= { isActive: false }).manifest = manifest;
    }),

  activateQuickView: (id) =>
    set((state) => {
      (state.quickViews[id] ??= { isActive: true }).isActive = true;
    }),
  deactivateQuickView: (id) =>
    set((state) => {
      (state.quickViews[id] ??= { isActive: false }).isActive = false;
    }),
  setQuickViewDefinition: (id, definition) =>
    set((state) => {
      (state.quickViews[id] ??= { isActive: false }).definition = definition;
    }),
  setQuickViewScript: (id, path, script) =>
    set((state) => {
      const qv = (state.quickViews[id] ??= { isActive: false });
      qv.path = path;
      qv.script = script;
    }),

  activateIconTheme: (id) =>
    set((state) => {
      (state.iconThemes[id] ??= { isActive: true }).isActive = true;
    }),
  deactivateIconTheme: (id) =>
    set((state) => {
      (state.iconThemes[id] ??= { isActive: false }).isActive = false;
    }),
  setIconThemeDefinition: (id, definition) =>
    set((state) => {
      (state.iconThemes[id] ??= { isActive: false }).definition = definition;
    }),
  setIconTheme: (id, path, theme) =>
    set((state) => {
      const it = (state.iconThemes[id] ??= { isActive: false });
      it.path = path;
      it.theme = theme;
    }),
});
