import { useEffect, useState } from "react";
import { useFileContent } from "./useFileContent";

export function useFileUrl(path?: string, skip = false) {
  const { content } = useFileContent(path, skip);
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (content) {
      const objectUrl = URL.createObjectURL(new Blob([content]));
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [content]);

  return url;
}
