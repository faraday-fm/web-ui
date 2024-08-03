import { type InferOutput, object, optional, string } from "valibot";

export const Settings = object({
  iconThemeId: string(),
  lang: optional(string()),
});

export type Settings = InferOutput<typeof Settings>;
