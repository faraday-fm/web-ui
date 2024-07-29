import { useEffect, useRef, useState } from "react";
import { useFileSystem } from "./FileSystemContext";

interface FileContent {
  done: boolean;
  error?: Error;
  content?: Uint8Array;
  path?: string;
  skipped: boolean;
}

function getError(error: unknown, path: string) {
  return error instanceof Error ? error : new Error(`Unable to read file ${path}`);
}

export function useFileContent(path?: string, skip = false) {
  const fs = useFileSystem();
  const [result, setResult] = useState<FileContent>({ done: false, path, skipped: skip });
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
    try {
      let timeout = 0;
      fs.watchFile(
        path,
        () => {
          clearTimeout(timeout);
          timeout = window.setTimeout(() => {
            fs.readFile(path, { signal: abortController.signal })
              .then((content) => {
                setResult({ done: true, content, path, skipped: false });
              })
              .catch((error) => {
                if (counter.current === pendingOp) {
                  setResult({ done: false, error: getError(error, path), path, skipped: false });
                }
              });
          }, 100);
        },
        { signal: abortController.signal }
      ).catch((error: unknown) => {
        const err = error instanceof Error ? error : new Error(`Unable to read file ${path}`);
        if (counter.current === pendingOp) {
          setResult({ done: false, error: err, path, skipped: false });
        }
      });
      fs.readFile(path, { signal: abortController.signal })
        .then((content) => {
          if (counter.current === pendingOp) {
            setResult({ done: true, content, path, skipped: false });
          }
        })
        .catch((error: unknown) => {
          if (counter.current === pendingOp) {
            setResult({ done: false, error: getError(error, path), path, skipped: false });
          }
        });
    } catch (error) {
      if (counter.current === pendingOp) {
        setResult({ done: false, error: getError(error, path), path, skipped: false });
      }
    }
    return () => abortController.abort();
  }, [fs, path, skip]);

  return result;
}
