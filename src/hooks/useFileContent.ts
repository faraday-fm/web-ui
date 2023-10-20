import JSON5 from "json5";
import { useEffect, useMemo, useRef, useState } from "react";
import { ZodType } from "zod";

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

export function useFileJsonContent<TSchema extends ZodType>(path: string, schema: TSchema): { error?: unknown; content?: Zod.infer<typeof schema> } {
  const stringContent = useFileStringContent(path);
  return useMemo(() => {
    const { error, content } = stringContent;
    if (error) {
      return { error };
    }
    if (typeof content === "undefined") {
      return {};
    }
    try {
      return { content: content ? (schema.parse(JSON5.parse(content)) as TSchema) : undefined };
    } catch (error) {
      return { error };
    }
  }, [schema, stringContent]);
}
