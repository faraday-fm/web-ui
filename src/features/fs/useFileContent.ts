import { useEffect, useRef, useState } from "react";
import { filestream } from "./filestream";
import { useFs } from "./useFs";
import { streamToUint8Array } from "./streamToUint8Array";

interface FileContent {
  done: boolean;
  error?: unknown;
  content?: Uint8Array;
  path?: string;
  skipped: boolean;
}

export function useFileContent(path?: string, skip = false) {
  const fs = useFs();
  const [result, setResult] = useState<FileContent>({
    done: false,
    path,
    skipped: skip,
  });
  const counter = useRef(0);

  useEffect(() => {
    counter.current++;
    if (!path || skip) {
      setResult({ done: true, path, skipped: true });
      return;
    }
    setResult({ done: false, path, skipped: false });
    const abortController = new AbortController();
    const pendingOp = counter.current;
    const readStream = async () => {
      const stream = filestream(fs, path, abortController.signal);
      const content = await streamToUint8Array(stream);
      setResult({ done: true, content, path, skipped: false });
    };
    readStream().catch((error: unknown) => {
      if (counter.current === pendingOp) {
        setResult({ done: false, error, path, skipped: false });
      }
    });
    return () => abortController.abort();
  }, [fs, path, skip]);

  return result;
}
