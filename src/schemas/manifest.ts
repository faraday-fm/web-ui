import { Output, array, enumType, object, optional, string } from "valibot";

const QuickViewSchema = object({
  id: string(),
  extensions: optional(array(string())),
  filenames: optional(array(string())),
  mimetypes: optional(array(string())),
  path: string(),
});

const IconThemeSchema = object({
  id: string(),
  label: string(),
  path: string(),
});

const ThemeSchema = object({
  label: string(),
  uiTheme: enumType(["fd", "fd-light", "hc", "hc-light"]),
  path: string(),
});

const ContributesSchema = object({
  quickViews: optional(array(QuickViewSchema)),
  iconThemes: optional(array(IconThemeSchema)),
  themes: optional(array(ThemeSchema)),
});

export const ExtensionManifestSchema = object({
  name: string(),
  version: string(),
  displayName: string(),
  description: string(),
  publisher: string(),
  main: optional(string()),
  browser: optional(string()),
  contributes: optional(ContributesSchema),
});

export type QuickView = Output<typeof QuickViewSchema>;

export type Contributes = Output<typeof ContributesSchema>;

export type ExtensionManifest = Output<typeof ExtensionManifestSchema>;
