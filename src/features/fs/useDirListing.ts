import { useEffect } from "react";
import { type List, createList } from "../../utils/immutableList";
import type { FsEntry } from "./types";
import { useFs } from "./useFs";

export function useDirListing(path: string | undefined, onListUpdated: (path: string, files: List<FsEntry>) => void) {
  const fs = useFs();

  useEffect(() => {
    if (!path) return undefined;

    const abortController = new AbortController();
    void (async () => {
      let items = createList<FsEntry>();
      let isReady = false;
      try {
        let timeoutId: number;
        const updateItems = () => onListUpdated(path, items);
        await fs.watchDir(
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
                    {
                      const idx = items.findIndex((e) => e.name === name);
                      if (idx >= 0) {
                        items = items.set(idx, change.entry);
                      } else {
                        items = items.append(change.entry);
                      }
                    }
                    break;
                  case "deleted":
                    {
                      const idx = items.findIndex((e) => e.name === name);
                      if (idx >= 0) {
                        items = items.delete(idx);
                      }
                    }
                    break;
                  case "changed":
                    {
                      const idx = items.findIndex((e) => e.name === name);
                      if (idx >= 0) {
                        items = items.set(idx, change.entry);
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
          { signal: abortController.signal },
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
