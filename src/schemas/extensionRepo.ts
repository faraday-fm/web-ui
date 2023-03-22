import { z } from "zod";

const ExtensionRefSchema = z.object({
  identifier: z.object({
    uuid: z.string(),
  }),
  relativeLocation: z.string(),
});

export const ExtensionRepoSchema = z.array(ExtensionRefSchema);
