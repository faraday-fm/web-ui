import { useMemo } from "react";
import { useFileContent } from "./useFileContent";

const decoder = new TextDecoder();

interface FileStringContent {
  content?: string;
  error?: Error;
}

export function useFileStringContent({ path, skip = false }: { path?: string; skip?: boolean }): FileStringContent {
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
      return { error: new Error(`Unable to read file ${path}`, { cause: error }) };
    }
  }, [fileContent, path]);
}
