import { Output, array, object, optional, string } from "valibot";

export const KeyBindingSchema = object({
  key: string(),
  command: string(),
  when: optional(string()),
  args: optional(string()),
});

export const KeyBindingsSchema = array(KeyBindingSchema);

export type KeyBindingsSchema = Output<typeof KeyBindingsSchema>;
