import { z } from "zod";

const FontDefinitionSchema = z.object({
  id: z.string(),
  src: z.array(z.object({ path: z.string(), format: z.string() })),
  weight: z.string(),
  style: z.string(),
  size: z.string(),
});

const SvgIconDefinitionSchema = z.object({ iconPath: z.string() });

const FontIconDefinitionSchema = z.object({ fontCharacter: z.ostring(), fontColor: z.optional(z.union([z.string(), z.record(z.string())])) });

const IconDefinitionSchema = z.union([SvgIconDefinitionSchema, FontIconDefinitionSchema]);

const IconDefinitionsSchema = z.record(IconDefinitionSchema);

const ThemeSchema = {
  folderNames: z.optional(z.record(z.string())),
  folderNamesExpanded: z.optional(z.record(z.string())),
  fileExtensions: z.optional(z.record(z.string())),
  fileNames: z.optional(z.record(z.string())),
  languageIds: z.optional(z.record(z.string())),
};

export const IconThemeSchema = z.object({
  fonts: z.optional(z.array(FontDefinitionSchema)),
  iconDefinitions: IconDefinitionsSchema,
  ...ThemeSchema,
  light: z.optional(z.object({ ...ThemeSchema })),
  highContrast: z.optional(z.object({ ...ThemeSchema })),
  highContrastLight: z.optional(z.object({ ...ThemeSchema })),
  file: z.string(),
  folder: z.string(),
  folderExpanded: z.ostring(),
  rootFolder: z.ostring(),
  rootFolderExpanded: z.ostring(),
});

export type SvgIconDefinition = z.infer<typeof SvgIconDefinitionSchema>;

export type IconDefinition = z.infer<typeof IconDefinitionSchema>;

export type IconTheme = z.infer<typeof IconThemeSchema>;

export function isSvgIcon(def?: IconDefinition): def is SvgIconDefinition {
  return !!def && Object.hasOwn(def, "iconPath");
}
