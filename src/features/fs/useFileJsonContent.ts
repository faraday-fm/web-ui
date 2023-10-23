import JSON5 from "json5";
import { useMemo } from "react";
import { ZodType } from "zod";
import { useFileStringContent } from "./useFileStringContent";

export function useFileJsonContent<TSchema extends ZodType>(path: string, schema: TSchema): { error?: unknown; content?: Zod.infer<typeof schema> } {
  const stringContent = useFileStringContent(path);
  return useMemo(() => {
    const { error, content } = stringContent;
    if (error) {
      return { error };
    }
    if (typeof content === "undefined") {
      return {};
    }
    try {
      return { content: content ? (schema.parse(JSON5.parse(content)) as TSchema) : undefined };
    } catch (error) {
      return { error };
    }
  }, [schema, stringContent]);
}
