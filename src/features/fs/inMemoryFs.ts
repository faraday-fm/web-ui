import { append } from "@utils/urlUtils";

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
  return path.split("/");
}

export class InMemoryFsProvider implements FileSystemProvider {
  private root: Dir;

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
    currDir.children.push({ isDir: true, isMoundedFs: true, isFile: false, fs, name: newDirName });
  }

  async watch(path: string, watcher: FileSystemWatcher, options: { recursive: boolean; excludes: string[]; signal?: AbortSignal }) {
    const entries = await this.readDirectory(path, options);
    watcher(entries.map((e) => ({ type: "created", entry: e, path: append(path, e.name) })));
    watcher([{ type: "ready" }]);
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
    currDir.children.push({ isDir: true, isFile: false, isMoundedFs: false, name: newDirName, children: [] });
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
}
