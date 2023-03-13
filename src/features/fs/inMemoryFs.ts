import { append, isRoot } from "@utils/path";

import { FileSystemError } from "./FileSystemError";
import { FileSystemProvider, FileSystemWatcher, FsEntry } from "./types";

type Dir = FsEntry & { isDir: true; isFile: false; isMoundedFs: false; children: Entry[] };
type File = FsEntry & { isFile: true; isDir: false; content: Uint8Array };
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
  let parts = path.split("/").filter((p) => p !== ".");
  let i = 0;
  while (i < parts.length) {
    if (parts[i] === ".." && i > 0) {
      parts = parts.splice(i - 1, 2);
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

  mount(path: string, fs: FileSystemProvider) {
    const parts = getPathParts(path);
    if (parts.length === 0) {
      throw FileSystemError.FileNotADirectory();
    }
    const newDirName = parts[parts.length - 1];
    let currDir: Dir | MountedFs = this.root;
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (currDir.isMoundedFs) {
        if (currDir.fs.mount) {
          currDir.fs.mount(parts.slice(i).join("/"), fs);
          return;
        }
        throw FileSystemError.MountNotSupported();
      }
      const nextDir: Entry | undefined = currDir.children.find((child) => child.name === parts[i]);
      if (!nextDir) {
        throw FileSystemError.FileNotFound();
      }
      if (!nextDir.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currDir = nextDir;
    }

    if (currDir.isMoundedFs) {
      throw FileSystemError.MountNotSupported();
    }
    const newDir: MountedFs = { isDir: true, isMoundedFs: true, isFile: false, fs, name: newDirName };
    currDir.children.push(newDir);
    const watchers = this.watchers.get(parts.slice(0, parts.length - 1).join("/"));
    if (watchers) {
      watchers.forEach((w) => w([{ type: "created", entry: newDir, path }]));
    }
  }

  async watch(path: string, watcher: FileSystemWatcher, options: { recursive: boolean; excludes: string[]; signal?: AbortSignal }) {
    const entry = this.getEntry(path);
    if (entry?.isDir) {
      const entries = await this.readDirectory(path, options);
      watcher(entries.map((e) => ({ type: "created", entry: e, path: append(path, e.name) })));
      watcher([{ type: "ready" }]);
    } else {
      if (entry) {
        watcher([{ type: "created", entry, path }]);
      }
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

  readDirectory(path: string, options?: { signal?: AbortSignal }): FsEntry[] | Promise<FsEntry[]> {
    const parts = getPathParts(path);
    let currDir: Dir | MountedFs = this.root;
    for (let i = 0; i < parts.length; i += 1) {
      if (currDir.isMoundedFs) {
        return currDir.fs.readDirectory(parts.slice(i).join("/"));
      }
      const nextDir: Entry | undefined = currDir.children.find((child) => child.name === parts[i]);
      if (!nextDir) {
        throw FileSystemError.FileNotFound();
      }
      if (!nextDir.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currDir = nextDir;
    }

    return currDir.isMoundedFs ? currDir.fs.readDirectory("", options) : currDir.children;
  }

  createDirectory(path: string, options?: { signal?: AbortSignal }): void | Promise<void> {
    const parts = getPathParts(path);
    let currDir: Dir | MountedFs = this.root;
    const newDirName = parts[parts.length - 1];
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (currDir.isMoundedFs) {
        return currDir.fs.createDirectory(parts.slice(i).join("/"), options);
      }
      const nextDir: Entry | undefined = currDir.children.find((child) => child.name === parts[i]);
      if (!nextDir) {
        throw FileSystemError.FileNotFound();
      }
      if (!nextDir.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currDir = nextDir;
    }
    if (currDir.isMoundedFs) {
      return currDir.fs.createDirectory(newDirName, options);
    }
    if (currDir.children.find((child) => child.name === newDirName)) {
      throw FileSystemError.FileExists();
    }
    const newDir: Dir = { isDir: true, isFile: false, isMoundedFs: false, name: newDirName, children: [] };
    currDir.children.push(newDir);
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
    let currDir: Dir | MountedFs = this.root;
    const fileName = parts[parts.length - 1];
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (currDir.isMoundedFs) {
        return currDir.fs.readFile(parts.slice(i).join("/"), options);
      }
      const nextDir: Entry | undefined = currDir.children.find((child) => child.name === parts[i]);
      if (!nextDir) {
        throw FileSystemError.FileNotFound();
      }
      if (!nextDir.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currDir = nextDir;
    }
    if (currDir.isMoundedFs) {
      return currDir.fs.readFile(fileName);
    }
    const file = currDir.children.find((child) => child.name === fileName);
    if (!file) {
      throw FileSystemError.FileNotFound();
    }
    if (!file.isFile) {
      throw FileSystemError.FileIsADirectory();
    }
    return file.content;
  }

  writeFile(path: string, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean; signal?: AbortSignal }) {
    const parts = getPathParts(path);
    if (parts.length === 0) {
      throw FileSystemError.FileIsADirectory();
    }
    let currDir: Dir | MountedFs = this.root;
    const fileName = parts[parts.length - 1];
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (currDir.isMoundedFs) {
        return currDir.fs.writeFile(parts.slice(i).join("/"), content, options);
      }
      const nextDir: Entry | undefined = currDir.children.find((child) => child.name === parts[i]);
      if (!nextDir) {
        throw FileSystemError.FileNotFound();
      }
      if (!nextDir.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currDir = nextDir;
    }
    if (currDir.isMoundedFs) {
      return currDir.fs.writeFile(fileName, content, options);
    }
    let file = currDir.children.find((child) => child.name === fileName);
    if (file?.isDir) {
      throw FileSystemError.FileIsADirectory();
    }
    if (!file && !options?.create) {
      throw FileSystemError.FileNotFound();
    }
    if (file) {
      if (!options?.overwrite) {
        throw FileSystemError.FileExists();
      }
      file.content = content;
    } else {
      file = { isFile: true, isDir: false, name: fileName, content, size: content.byteLength };
      currDir.children.push(file);
    }
    return Promise.resolve();
  }

  delete(path: string, options?: { recursive: boolean; signal?: AbortSignal }) {
    throw new Error("Method not implemented.");
  }

  rename(oldPath: string, newPath: string, options?: { overwrite?: boolean; signal?: AbortSignal }) {
    throw new Error("Method not implemented.");
  }

  copy?(source: string, destination: string, options?: { overwrite?: boolean; signal?: AbortSignal }) {
    throw new Error("Method not implemented.");
  }

  getEntry(path: string): Entry | undefined {
    if (isRoot(path)) {
      return this.root;
    }
    const parts = getPathParts(path);
    let currDir: Dir = this.root;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const nextDir: Entry | undefined = currDir.children.find((child) => child.name === parts[i]);
      if (!nextDir) {
        throw FileSystemError.FileNotFound();
      }
      if (!nextDir.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      if (nextDir.isMoundedFs) {
        throw FileSystemError.FileNotADirectory();
      }
      currDir = nextDir;
    }

    return currDir.children.find((child) => child.name === parts[parts.length - 1]);
  }
}
