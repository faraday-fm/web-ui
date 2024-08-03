import { type InferOutput, array, object, optional, record, string, union } from "valibot";

const FontDefinitionSchema = object({
  id: string(),
  src: array(object({ path: string(), format: string() })),
  weight: string(),
  style: string(),
  size: string(),
});

const SvgIconDefinitionSchema = object({ iconPath: string() });

const FontIconDefinitionSchema = object({
  fontId: optional(string()),
  fontCharacter: string(),
  fontColor: optional(union([string(), record(string(), string())])),
});

const IconDefinitionSchema = union([SvgIconDefinitionSchema, FontIconDefinitionSchema]);

const IconDefinitionsSchema = record(string(), IconDefinitionSchema);

const ThemeSchema = object({
  folderNames: optional(record(string(), string())),
  folderNamesExpanded: optional(record(string(), string())),
  fileExtensions: optional(record(string(), string())),
  fileNames: optional(record(string(), string())),
  languageIds: optional(record(string(), string())),
});

export const IconThemeSchema = object({
  ...ThemeSchema.entries,
  fonts: optional(array(FontDefinitionSchema)),
  iconDefinitions: IconDefinitionsSchema,
  file: string(),
  folder: string(),
  folderExpanded: optional(string()),
  rootFolder: optional(string()),
  rootFolderExpanded: optional(string()),
  light: optional(ThemeSchema),
  highContrast: optional(ThemeSchema),
  highContrastLight: optional(ThemeSchema),
});

export type SvgIconDefinition = InferOutput<typeof SvgIconDefinitionSchema>;

export type FontIconDefinition = InferOutput<typeof FontIconDefinitionSchema>;

export type IconDefinition = InferOutput<typeof IconDefinitionSchema>;

export type IconTheme = InferOutput<typeof IconThemeSchema>;

export function isSvgIcon(def?: IconDefinition): def is SvgIconDefinition {
  return !!def && Object.hasOwn(def, "iconPath");
}
