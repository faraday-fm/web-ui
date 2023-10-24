import JSON5 from "json5";
import { useMemo } from "react";
import { BaseSchema, Output, parse } from "valibot";
import { useFileStringContent } from "./useFileStringContent";

export function useFileJsonContent<TSchema extends BaseSchema>(path: string, schema: TSchema): { error?: unknown; content?: Output<typeof schema> } {
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
      return { content: content ? (parse(schema, JSON5.parse(content)) as TSchema) : undefined };
    } catch (error) {
      return { error };
    }
  }, [schema, stringContent]);
}
