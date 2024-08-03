import { type InferOutput, array, enum as enum_, object, optional, string } from "valibot";

const QuickViewDefinition = object({
  id: string(),
  extensions: optional(array(string())),
  filenames: optional(array(string())),
  mimetypes: optional(array(string())),
  path: string(),
});

const IconThemeDefinition = object({
  id: string(),
  label: string(),
  path: string(),
});

const ThemeDefinition = object({
  label: string(),
  uiTheme: enum_({
    fd: "fd",
    "fd-light": "fd-light",
    hc: "hc",
    "hc-light": "hc-light",
  }),
  path: string(),
});

const Contributes = object({
  quickViews: optional(array(QuickViewDefinition)),
  iconThemes: optional(array(IconThemeDefinition)),
  themes: optional(array(ThemeDefinition)),
});

export const ExtensionManifest = object({
  name: string(),
  version: string(),
  displayName: string(),
  description: string(),
  publisher: string(),
  main: optional(string()),
  browser: optional(string()),
  contributes: optional(Contributes),
});

export type QuickViewDefinition = InferOutput<typeof QuickViewDefinition>;

export type IconThemeDefinition = InferOutput<typeof IconThemeDefinition>;

export type Contributes = InferOutput<typeof Contributes>;

export type ExtensionManifest = InferOutput<typeof ExtensionManifest>;
