import { z } from "zod";

export const KeyBindingSchema = z.object({
  key: z.string(),
  command: z.string(),
  when: z.ostring(),
  args: z.ostring(),
});

export const KeyBindingsSchema = z.array(KeyBindingSchema);

export type KeyBindingsSchema = z.infer<typeof KeyBindingsSchema>;
