import { z } from "zod";

const QuickViewSchema = z.object({
  extensions: z.optional(z.array(z.string())),
  filenames: z.optional(z.array(z.string())),
  mimetypes: z.optional(z.array(z.string())),
  path: z.string(),
});

const IconThemeSchema = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string(),
});

const ThemeSchema = z.object({
  label: z.string(),
  uiTheme: z.enum(["fd", "fd-light", "hc", "hc-light"]),
  path: z.string(),
});

const ContributesSchema = z.object({
  quickViews: z.optional(z.array(QuickViewSchema)),
  iconThemes: z.optional(z.array(IconThemeSchema)),
  themes: z.optional(z.array(ThemeSchema)),
});

export const ManifestSchema = z.object({
  name: z.string(),
  version: z.string(),
  displayName: z.string(),
  description: z.string(),
  publisher: z.string(),
  main: z.optional(z.string()),
  browser: z.optional(z.string()),
  contributes: z.optional(ContributesSchema),
});

export type Manifest = z.infer<typeof ManifestSchema>;
