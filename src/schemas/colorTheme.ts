import { type InferOutput, object, optional, record, string } from "valibot";

export const ColorThemeSchema = object({
  name: string(),
  colors: optional(record(string(), string())),
});

export type ColorTheme = InferOutput<typeof ColorThemeSchema>;
