import { FsEntry } from "@features/fs/types";
import { empty, List } from "list";
import { useEffect } from "react";

import { useFs } from "./useFs";

export function useDirListing(path: string | undefined, onListUpdated: (path: string, files: List<FsEntry>) => void) {
  const fs = useFs();

  useEffect(() => {
    if (!path) return undefined;

    const abortController = new AbortController();
    void (async () => {
      let items = empty<FsEntry>();
      let isReady = false;
      try {
        let timeoutId: number;
        const updateItems = () => onListUpdated(path, items);
        await fs.watch(
          path,
          (changes) => {
            changes.forEach((change) => {
              if (change.type === "ready") {
                isReady = true;
                updateItems();
              } else {
                const { name } = change.entry;
                if (!name) return;
                switch (change.type) {
                  case "created":
                    const idx = items.findIndex((e) => e.name === name);
                    if (idx >= 0) {
                      items = items.update(idx, change.entry);
                    } else {
                      items = items.append(change.entry);
                    }
                    break;
                  case "deleted":
                    {
                      const idx = items.findIndex((e) => e.name === name);
                      if (idx >= 0) {
                        items = items.remove(idx, 1);
                      }
                    }
                    break;
                  case "changed":
                    {
                      const idx = items.findIndex((e) => e.name === name);
                      if (idx >= 0) {
                        items = items.update(idx, change.entry);
                      }
                    }
                    break;
                }
                if (isReady) {
                  clearTimeout(timeoutId);
                  timeoutId = window.setTimeout(updateItems, 0);
                }
              }
            });
          },
          { recursive: false, excludes: [], signal: abortController.signal }
        );
      } catch (err) {
        console.error(err);
        items = items.append({ name: "ERROR!", isFile: true });
        onListUpdated(path, items);
      }
    })();
    return () => abortController.abort();
  }, [fs, onListUpdated, path]);
}
