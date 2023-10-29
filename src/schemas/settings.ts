import { Output, object, string } from "valibot";

export const Settings = object({
  iconThemeId: string(),
});

export type Settings = Output<typeof Settings>;
