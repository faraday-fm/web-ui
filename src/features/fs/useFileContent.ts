import { useEffect, useRef, useState } from "react";

import { useFs } from "./useFs";

export function useFileContent(path: string) {
  const fs = useFs();
  const [result, setResult] = useState<{ done: boolean; error?: unknown; content?: Uint8Array; path: string }>({ done: false, path });
  const counter = useRef(0);

  useEffect(() => {
    const abortController = new AbortController();
    let isReady = false;
    (() => {
      counter.current += 1;
      const pendingOp = counter.current;
      try {
        setResult({ done: false, path });
        void fs.watch(
          path,
          (events) => {
            events.forEach((e) => {
              if (e.type === "ready") isReady = true;
            });
            if (isReady) {
              fs.readFile(path, { signal: abortController.signal })
                .then((content) => {
                  setResult({ done: true, content, path });
                })
                .catch(() => {
                  /* todo */
                });
            }
          },
          { signal: abortController.signal }
        );
        // if (counter.current === pendingOp) {
        //   setResult({ done: true, content });
        // }
      } catch (error) {
        if (counter.current === pendingOp) {
          setResult({ done: false, error, path });
        }
      }
    })();
    return () => abortController.abort();
  }, [fs, path]);

  return result;
}
