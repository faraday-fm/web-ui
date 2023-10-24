import { Output, array, object, optional, record, string, union } from "valibot";

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
  fontColor: optional(union([string(), record(string())])),
});

const IconDefinitionSchema = union([SvgIconDefinitionSchema, FontIconDefinitionSchema]);

const IconDefinitionsSchema = record(IconDefinitionSchema);

const ThemeSchema = object({
  folderNames: optional(record(string())),
  folderNamesExpanded: optional(record(string())),
  fileExtensions: optional(record(string())),
  fileNames: optional(record(string())),
  languageIds: optional(record(string())),
});

export const IconThemeSchema = object({
  ...ThemeSchema.object,
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

export type SvgIconDefinition = Output<typeof SvgIconDefinitionSchema>;

export type FontIconDefinition = Output<typeof FontIconDefinitionSchema>;

export type IconDefinition = Output<typeof IconDefinitionSchema>;

export type IconTheme = Output<typeof IconThemeSchema>;

export function isSvgIcon(def?: IconDefinition): def is SvgIconDefinition {
  return !!def && Object.hasOwn(def, "iconPath");
}
