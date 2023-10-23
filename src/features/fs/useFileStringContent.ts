import { useMemo } from "react";
import { useFileContent } from "./useFileContent";

const decoder = new TextDecoder();

export function useFileStringContent(path: string) {
  const fileContent = useFileContent(path);

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
