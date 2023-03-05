import { FsEntry } from "@features/fs/types";
import { isRoot } from "@utils/urlUtils";
import { empty, List, list } from "list";
import { useEffect } from "react";

import { useFs } from "./useFs";

export function useDirListing(url: string | undefined, onListUpdated: (url: string, files: List<FsEntry>) => void) {
  const fs = useFs();

  useEffect(() => {
    if (!url) return undefined;

    const abortController = new AbortController();
    (async () => {
      let items = empty<FsEntry>();
      let isReady = false;
      try {
        let timeoutId: number;
        const updateItems = () => onListUpdated(url, items);
        await fs.watch(
          url,
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
                  timeoutId = setTimeout(updateItems, 0);
                }
              }
            });
          },
          { recursive: false, excludes: [], signal: abortController.signal }
        );
      } catch (err) {
        console.error(err);
        items = items.append({ name: "ERROR!", isFile: true });
        onListUpdated(url, items);
      }
    })();
    return () => abortController.abort();
  }, [fs, onListUpdated, url]);
}
