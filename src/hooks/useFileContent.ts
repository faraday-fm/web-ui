import { useEffect, useRef, useState } from "react";

import { useFs } from "./useFs";

export function useFileContent(url: string) {
  const fs = useFs();
  const [result, setResult] = useState<{ done: boolean; error?: unknown; content?: Uint8Array }>({ done: false });
  const counter = useRef(0);

  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      counter.current += 1;
      const pendingOp = counter.current;
      try {
        setResult({ done: false });
        const content = await fs.readFile(url, abortController.signal);
        if (counter.current === pendingOp) {
          setResult({ done: true, content });
        }
      } catch (error) {
        if (counter.current === pendingOp) {
          setResult({ done: false, error });
        }
      }
    })();
    return () => abortController.abort();
  }, [fs, url]);

  return result;
}
