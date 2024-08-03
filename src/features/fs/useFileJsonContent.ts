import JSON5 from "json5";
import { useMemo } from "react";
import { type BaseIssue, type BaseSchema, type InferOutput, parse } from "valibot";
import { useFileStringContent } from "./useFileStringContent";

export function useFileJsonContent<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  path: string | undefined,
  schema: TSchema,
  skip = false,
): { error?: unknown; content?: InferOutput<typeof schema> } {
  const stringContent = useFileStringContent(path, skip);
  return useMemo(() => {
    const { error, content } = stringContent;
    if (error) {
      return { error };
    }
    if (typeof content === "undefined") {
      return {};
    }
    try {
      return {
        content: content ? (parse(schema, JSON5.parse(content)) as TSchema) : undefined,
      };
    } catch (error) {
      return { error };
    }
  }, [schema, stringContent]);
}
