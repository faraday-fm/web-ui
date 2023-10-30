import { useMemo } from "react";
import { useFileContent } from "./useFileContent";

const decoder = new TextDecoder();

interface FileStringContent {
  content?: string;
  error?: unknown;
}

export function useFileStringContent(path?: string, skip = false): FileStringContent {
  const fileContent = useFileContent(path, skip);

  return useMemo(() => {
    const { content, error } = fileContent;
    if (error) {
      return { error };
    }
    if (typeof content === "undefined") {
      return {};
    }
    try {
      return { content: content ? decoder.decode(content) : undefined };
    } catch (error) {
      return { error };
    }
  }, [fileContent]);
}
