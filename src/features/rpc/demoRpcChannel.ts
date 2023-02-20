import { FsEntry } from "@types";
import { splitPath } from "@utils/pathUtils";
import { IRpcChannel } from "./rpcChannel";

type File = Omit<FsEntry, "dir" | "file" | "symlink"> & { dir: false; file: true; size: number };
type Dir = Omit<FsEntry, "dir" | "file" | "symlink"> & { dir: true; file: false; items: Entry[] };
type Entry = Dir | File;

function createManyFiles() {
  const result: File[] = [];
  for (let i = 0; i < 10000; i += 1) {
    result.push({ dir: false, file: true, name: i.toString(), size: 123 });
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vfs: Dir = {
  dir: true,
  file: false,
  name: "/",
  items: [
    {
      dir: true,
      file: false,
      name: "far-more.app",
      items: [
        { dir: false, file: true, name: "README.md", size: 123 },
        {
          dir: true,
          file: false,
          name: "Releases",
          items: [
            {
              dir: true,
              file: false,
              name: "Windows",
              items: [
                {
                  dir: true,
                  file: false,
                  name: "Stable",
                  items: [{ dir: false, file: true, name: "far-more-1.0.exe", size: 123 }],
                },
              ],
            },
            {
              dir: true,
              file: false,
              name: "Mac OS",
              items: [
                {
                  dir: true,
                  file: false,
                  name: "Stable",
                  items: [{ dir: false, file: true, name: "far-more-1.0.dmg", size: 123 }],
                },
              ],
            },
            {
              dir: true,
              file: false,
              name: "Linux",
              items: [
                {
                  dir: true,
                  file: false,
                  name: "Stable",
                  items: [{ dir: false, file: true, name: "far-more-1.0.deb", size: 123 }],
                },
              ],
            },
          ],
        },
        {
          dir: true,
          file: false,
          name: "News",
          items: [{ dir: false, file: true, name: "2023-02-01.md", size: 123 }],
        },
        {
          dir: true,
          file: false,
          name: "Many Files",
          items: createManyFiles(),
        },
      ],
    },
    {
      dir: true,
      file: false,
      name: "TypeScript",
      items: [],
    },
  ],
};

export class DemoRpcChannel implements IRpcChannel {
  async call(funcName: string, params: unknown): Promise<unknown> {
    switch (funcName) {
      case "listDir":
        const path = params as string;
        const parts = splitPath(path, "/");
        // if (parts.length === 1 && parts[0] === "TypeScript") {
        //   const r = await fetch(`https://api.github.com/repos/microsoft/TypeScript/git/trees/main`);
        //   const r2 = await r.json();
        //   return r2.tree.map((x: any) => ({ parent: dir, name: x.path, dir: x.type === "tree", file: x.type === "blob", size: x.size, meta: x } as FsEntry));
        // }
        // if (dir.meta?.url) {
        //   const r = await fetch(dir.meta.url);
        //   const r2 = await r.json();
        //   return r2.tree.map((x: any) => ({ parent: dir, name: x.path, dir: x.type === "tree", file: x.type === "blob", size: x.size, meta: x } as FsEntry));
        // }
        let entry: Entry | undefined = vfs;
        let x = vfs.items;
        for (let i = 0; i < parts.length; i += 1) {
          entry = x.find((e) => e.name === parts[i]);
          if (entry?.dir) {
            x = entry.items;
          }
        }
        if (entry?.dir) {
          return Promise.resolve(entry.items.map((i) => ({ ...i })));
        }
        return Promise.reject(new Error("Error"));
        break;
      case "getRootDir":
        return Promise.resolve(vfs);
      case "getHomeDir":
        return Promise.resolve(vfs.items.find((i) => i.name === "far-more.app"));
      default:
        break;
    }
    return Promise.resolve();
  }

  subscribe(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFuncCall: (funcName: string, params: unknown) => Promise<unknown>
  ): () => void {
    return () => {
      /* skip */
    };
  }
}
