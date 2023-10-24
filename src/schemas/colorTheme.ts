import { Output, object, optional, record, string } from "valibot";

export const ColorThemeSchema = object({
  name: string(),
  colors: optional(record(string())),
});

export type ColorTheme = Output<typeof ColorThemeSchema>;
