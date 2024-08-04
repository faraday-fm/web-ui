import { type InferOutput, array, object, optional, string, any } from "valibot";

export const KeyBindingSchema = object({
  key: string(),
  command: string(),
  when: optional(string()),
  args: optional(any()),
});

export const KeyBindingsSchema = array(KeyBindingSchema);

export type KeyBindingsSchema = InferOutput<typeof KeyBindingsSchema>;
