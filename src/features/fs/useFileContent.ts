import { useEffect, useRef, useState } from "react";

import { useFs } from "./useFs";

export function useFileContent(path?: string, skip?: boolean) {
  const fs = useFs();
  const [result, setResult] = useState<{ done: boolean; error?: unknown; content?: Uint8Array; path?: string }>({ done: false, path });
  const counter = useRef(0);

  useEffect(() => {
    if (!path || skip) {
      setResult({ done: true, path });
      return;
    }
    const abortController = new AbortController();
    (() => {
      counter.current += 1;
      const pendingOp = counter.current;
      try {
        setResult({ done: false, path });
        void fs.watchFile(
          path,
          () => {
            fs.readFile(path, { signal: abortController.signal })
              .then((content) => {
                setResult({ done: true, content, path });
              })
              .catch(() => {
                /* todo */
              });
          },
          { signal: abortController.signal }
        );
        fs.readFile(path, { signal: abortController.signal })
          .then((content) => {
            setResult({ done: true, content, path });
          })
          .catch(() => {
            /* todo */
          });
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
  }, [fs, path, skip]);

  return result;
}
