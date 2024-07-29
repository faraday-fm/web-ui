import JSON5 from "json5";
import { useMemo, useRef } from "react";
import { BaseSchema, Output, parse } from "valibot";
import { useFileStringContent } from "./useFileStringContent";

export interface FileJsonContentParams<TSchema extends BaseSchema> {
  path: string | undefined;
  schema: TSchema;
  skip?: boolean;
  preserveLastValidContent?: boolean;
}

export function useFileJsonContent<TSchema extends BaseSchema>({
  path,
  schema,
  skip = false,
  preserveLastValidContent = true,
}: FileJsonContentParams<TSchema>): {
  error?: Error;
  content?: Output<typeof schema>;
} {
  const { content, error } = useFileStringContent({ path, skip });
  const lastValidContent = useRef<Output<typeof schema>>();

  return useMemo(() => {
    if (skip) {
      lastValidContent.current = undefined;
    }
    if (error) {
      if (preserveLastValidContent && lastValidContent.current) {
        return { error, content: lastValidContent.current };
      } else {
        return { error };
      }
    }
    if (typeof content === "undefined") {
      if (preserveLastValidContent && lastValidContent.current) {
        return { content: lastValidContent.current };
      } else {
        return {};
      }
    }
    try {
      const parsedContent = parse(schema, JSON5.parse(content));
      lastValidContent.current = preserveLastValidContent ? parsedContent : undefined;
      return {
        content: parsedContent,
      };
    } catch (error) {
      if (preserveLastValidContent && lastValidContent.current) {
        return {
          error: new Error("Unable to parse JSON", { cause: error }),
          content: lastValidContent.current,
        };
      } else
        return {
          error: new Error("Unable to parse JSON", { cause: error }),
        };
    }
  }, [content, error, preserveLastValidContent, schema, skip]);
}
