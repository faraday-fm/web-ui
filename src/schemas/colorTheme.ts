import { z } from "zod";

export const ColorThemeSchema = z.object({
  name: z.string(),
  colors: z.optional(z.record(z.string())),
});

export type ColorTheme = z.infer<typeof ColorThemeSchema>;
