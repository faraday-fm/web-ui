import { array, object, string } from "valibot";

const ExtensionRefSchema = object({
  identifier: object({
    uuid: string(),
  }),
  relativeLocation: string(),
});

export const ExtensionRepoSchema = array(ExtensionRefSchema);
