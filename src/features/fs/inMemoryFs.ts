import { combine } from "@utils/path";

import { FileSystemError } from "./FileSystemError";
import { FileSystemProvider, FileSystemWatcher, FsEntry } from "./types";

type Dir = FsEntry & { isDir: true; isFile: false; isMoundedFs: false; children: Entry[] };
type File = FsEntry & { isFile: true; isDir: false; isMoundedFs: false; content: Uint8Array };
type MountedFs = FsEntry & { isDir: true; isFile: false; isMoundedFs: true; fs: FileSystemProvider };

type Entry = Dir | File | MountedFs;

function getPathParts(path: string) {
  if (path.startsWith("/")) {
    path = path.substring(1);
  }
  if (path.endsWith("/")) {
    path = path.substring(0, path.length - 1);
  }
  if (path === "") {
    return [];
  }
  const parts = path.split("/").filter((p) => p !== ".");
  let i = 0;
  while (i < parts.length) {
    if (parts[i] === ".." && i > 0) {
      parts.splice(i - 1, 2);
    } else {
      i += 1;
    }
  }
  return parts;
}

export class InMemoryFsProvider implements FileSystemProvider {
  private root: Dir;

  private watchers = new Map<string, Set<FileSystemWatcher>>();

  constructor() {
    this.root = { name: "<root>", isDir: true, isMoundedFs: false, isFile: false, children: [] };
  }

  async mount(path: string, fs: FileSystemProvider) {
    const parts = getPathParts(path);
    if (parts.length === 0) {
      throw FileSystemError.FileNotADirectory();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const newDirName = parts.at(-1)!;
    let currEntry: Dir | MountedFs = this.root;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const nextEntry: Entry | undefined = currEntry.children.find((child) => child.name === parts[i]);
      if (!nextEntry) {
        throw FileSystemError.FileNotFound();
      }
      if (nextEntry.isMoundedFs) {
        if (!nextEntry.fs.mount) {
          throw FileSystemError.MountNotSupported();
        }
        // eslint-disable-next-line no-await-in-loop
        await nextEntry.fs.mount(parts.slice(i).join("/"), fs);
        return;
      }
      if (!nextEntry.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currEntry = nextEntry;
    }

    const entry = currEntry.children.find((child) => child.name === parts.at(-1));

    if (entry) {
      throw FileSystemError.MountNotSupported();
    }
    const newDir: MountedFs = { isDir: true, isMoundedFs: true, isFile: false, fs, name: newDirName };
    currEntry.children.push(newDir);
    const watchers = this.watchers.get(parts.slice(0, parts.length - 1).join("/"));
    if (watchers) {
      watchers.forEach((w) => w([{ type: "created", entry: newDir, path }]));
    }
  }

  async watch(path: string, watcher: FileSystemWatcher, options?: { signal?: AbortSignal }) {
    const parts = getPathParts(path);
    let currEntry: Dir | MountedFs = this.root;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const nextEntry: Entry | undefined = currEntry.children.find((child) => child.name === parts[i]);
      if (!nextEntry) {
        throw FileSystemError.FileNotFound();
      }
      if (nextEntry.isMoundedFs) {
        // eslint-disable-next-line no-await-in-loop
        await nextEntry.fs.watch(
          parts.slice(i + 1).join("/"),
          (events) =>
            watcher(
              events.map((e) => {
                if (e.type === "ready") return e;
                return { ...e, path: combine(parts.slice(0, i).join("/"), e.path) };
              })
            ),
          options
        );
        return;
      }
      if (!nextEntry.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currEntry = nextEntry;
    }

    const entry = parts.length === 0 ? currEntry : currEntry.children.find((child) => child.name === parts.at(-1));

    if (!entry) {
      throw FileSystemError.FileNotFound();
    }

    if (entry.isDir) {
      try {
        const entries = await this.readDirectory(path, options);
        watcher(entries.map((e) => ({ type: "created", entry: e, path: combine(path, e.name) })));
        watcher([{ type: "ready" }]);
      } catch {
        // todo
      }
    } else {
      watcher([{ type: "created", entry: currEntry, path: combine(path, currEntry.name) }]);
      watcher([{ type: "ready" }]);
    }

    let watchers = this.watchers.get(path);
    if (!watchers) {
      watchers = new Set();
      this.watchers.set(path, watchers);
    }
    watchers.add(watcher);
    options?.signal?.addEventListener("abort", () => {
      watchers?.delete(watcher);
      if (watchers?.size === 0) {
        this.watchers.delete(path);
      }
    });
  }

  readDirectory(path: string, options?: { signal?: AbortSignal }) {
    const parts = getPathParts(path);
    let currEntry: Dir | MountedFs = this.root;
    for (let i = 0; i < parts.length; i += 1) {
      const nextEntry: Entry | undefined = currEntry.children.find((child) => child.name === parts[i]);
      if (!nextEntry) {
        throw FileSystemError.FileNotFound();
      }
      if (nextEntry.isMoundedFs) {
        return nextEntry.fs.readDirectory(parts.slice(i + 1).join("/"), options);
      }
      if (!nextEntry.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currEntry = nextEntry;
    }

    const entry = currEntry;
    if (!entry) {
      throw FileSystemError.FileNotFound();
    }

    return Promise.resolve(currEntry.children);
  }

  createDirectory(path: string, options?: { signal?: AbortSignal }) {
    const parts = getPathParts(path);
    let currEntry: Dir | MountedFs = this.root;
    const newDirName = parts.at(-1) ?? "";
    for (let i = 0; i < parts.length - 1; i += 1) {
      const nextEntry: Entry | undefined = currEntry.children.find((child) => child.name === parts[i]);
      if (!nextEntry) {
        throw FileSystemError.FileNotFound();
      }
      if (nextEntry.isMoundedFs) {
        return nextEntry.fs.createDirectory(parts.slice(i + 1).join("/"), options);
      }
      if (!nextEntry.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currEntry = nextEntry;
    }
    if (currEntry.children.find((child) => child.name === newDirName)) {
      throw FileSystemError.FileExists();
    }
    const newDir: Dir = { isDir: true, isFile: false, isMoundedFs: false, name: newDirName, children: [] };
    currEntry.children.push(newDir);
    const watchers = this.watchers.get(parts.slice(0, parts.length - 1).join("/"));
    if (watchers) {
      watchers.forEach((w) => w([{ type: "created", entry: newDir, path }]));
    }
    return Promise.resolve();
  }

  readFile(path: string, options?: { signal?: AbortSignal }) {
    const parts = getPathParts(path);
    if (parts.length === 0) {
      throw FileSystemError.FileIsADirectory();
    }
    let currEntry: Dir | MountedFs = this.root;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const nextEntry: Entry | undefined = currEntry.children.find((child) => child.name === parts[i]);
      if (!nextEntry) {
        throw FileSystemError.FileNotFound();
      }
      if (nextEntry.isMoundedFs) {
        return nextEntry.fs.readFile(parts.slice(i + 1).join("/"), options);
      }
      if (!nextEntry.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currEntry = nextEntry;
    }

    const entry = currEntry.children.find((child) => child.name === parts.at(-1));
    if (!entry) {
      throw FileSystemError.FileNotFound();
    }
    if (!entry.isFile) {
      throw FileSystemError.FileIsADirectory();
    }

    return Promise.resolve(entry.content);
  }

  writeFile(path: string, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean; signal?: AbortSignal }) {
    const parts = getPathParts(path);
    if (parts.length === 0) {
      throw FileSystemError.FileIsADirectory();
    }
    let currEntry: Dir | MountedFs = this.root;
    const fileName = parts.at(-1) ?? "";
    for (let i = 0; i < parts.length - 1; i += 1) {
      const nextEntry: Entry | undefined = currEntry.children.find((child) => child.name === parts[i]);
      if (!nextEntry) {
        throw FileSystemError.FileNotFound();
      }
      if (nextEntry.isMoundedFs) {
        return nextEntry.fs.writeFile(parts.slice(i + 1).join("/"), content, options);
      }
      if (!nextEntry.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currEntry = nextEntry;
    }
    const entry = currEntry.children.find((child) => child.name === parts.at(-1));
    if (!entry && !options?.create) {
      throw FileSystemError.FileNotFound();
    }
    if (entry) {
      if (!entry.isFile) {
        throw FileSystemError.FileIsADirectory();
      }
      if (!options?.overwrite) {
        throw FileSystemError.FileExists();
      }
      entry.content = content;
    } else {
      currEntry.children.push({ isFile: true, isDir: false, isMoundedFs: false, name: fileName, content, size: content.byteLength });
    }
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(path: string, options?: { recursive: boolean; signal?: AbortSignal }): Promise<void> {
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rename(oldPath: string, newPath: string, options?: { overwrite?: boolean; signal?: AbortSignal }): Promise<void> {
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  copy?(source: string, destination: string, options?: { overwrite?: boolean; signal?: AbortSignal }): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
