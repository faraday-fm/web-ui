import { Disposable, FileChangeEvent, FileSystemProvider, FsEntry } from "@types";

import { FileSystemError } from "./FileSystemError";

type Dir = FsEntry & { isDir: true; isFile: false; children: DirOrFile[] };
type File = FsEntry & { isFile: true; isDir: false; content: Uint8Array };

type DirOrFile = Dir | File;

class InMemoryFsProvider implements FileSystemProvider {
  private root: Dir;

  constructor() {
    this.root = { name: "<root>", isDir: true, isFile: false, children: [] };
  }

  watch(url: URL, listener: (events: FileChangeEvent[]) => void, options: { recursive: boolean; excludes: string[] }): Disposable {
    throw new Error("Method not implemented.");
  }

  readDirectory(url: URL): FsEntry[] {
    const parts = decodeURI(url.pathname.substring(1, url.pathname.length - (url.pathname.endsWith("/") ? 1 : 0))).split("/");
    let currDir: Dir = this.root;
    parts
      .filter((c) => c)
      .forEach((part) => {
        const nextDir = currDir.children.find((child) => child.name === part);
        if (!nextDir) {
          throw FileSystemError.FileNotFound();
        }
        if (!nextDir.isDir) {
          throw FileSystemError.FileNotADirectory();
        }
        currDir = nextDir;
      });
    return currDir.children;
  }

  createDirectory(url: URL): void {
    const parts = decodeURI(url.pathname.substring(1)).split("/");
    let currDir: Dir = this.root;
    const newDirName = parts[parts.length - 1];
    parts
      .slice(0, parts.length - 1)
      .filter((c) => c)
      .forEach((part) => {
        const nextDir = currDir.children.find((child) => child.name === part);
        if (!nextDir) {
          throw FileSystemError.FileNotFound();
        }
        if (!nextDir.isDir) {
          throw FileSystemError.FileNotADirectory();
        }
        currDir = nextDir;
      });
    if (currDir.children.find((child) => child.name === newDirName)) {
      throw FileSystemError.FileExists();
    }
    currDir.children.push({ isDir: true, isFile: false, name: newDirName, children: [] });
  }

  readFile(url: URL): Uint8Array {
    const parts = decodeURI(url.pathname.substring(1)).split("/");
    let currDir: Dir = this.root;
    const fileName = parts[parts.length - 1];
    parts.slice(0, parts.length - 1).forEach((part) => {
      const nextDir = currDir.children.find((child) => child.name === part);
      if (!nextDir) {
        throw FileSystemError.FileNotFound();
      }
      if (!nextDir.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currDir = nextDir;
    });
    const file = currDir.children.find((child) => child.name === fileName);
    if (!file) {
      throw FileSystemError.FileNotFound();
    }
    if (!file.isFile) {
      throw FileSystemError.FileIsADirectory();
    }
    return file.content;
  }

  writeFile(url: URL, content: Uint8Array, options: { create: boolean; overwrite: boolean }): void {
    const parts = decodeURI(url.pathname.substring(1)).split("/");
    let currDir: Dir = this.root;
    const fileName = parts[parts.length - 1];
    parts.slice(0, parts.length - 1).forEach((part) => {
      const nextDir = currDir.children.find((child) => child.name === part);
      if (!nextDir) {
        throw FileSystemError.FileNotFound();
      }
      if (!nextDir.isDir) {
        throw FileSystemError.FileNotADirectory();
      }
      currDir = nextDir;
    });
    let file = currDir.children.find((child) => child.name === fileName);
    if (file?.isDir) {
      throw FileSystemError.FileIsADirectory();
    }
    if (!file && !options.create) {
      throw FileSystemError.FileNotFound();
    }
    if (file) {
      if (!options.overwrite) {
        throw FileSystemError.FileExists();
      }
      file.content = content;
    } else {
      file = { isFile: true, isDir: false, name: fileName, content, size: content.byteLength };
      currDir.children.push(file);
    }
  }

  delete(url: URL, options: { recursive: boolean }): void {
    throw new Error("Method not implemented.");
  }

  rename(oldUrl: URL, newUrl: URL, options: { overwrite: boolean }): void {
    throw new Error("Method not implemented.");
  }

  copy?(source: URL, destination: URL, options: { overwrite: boolean }): void {
    throw new Error("Method not implemented.");
  }
}

export function createInMemoryFs(): FileSystemProvider {
  return new InMemoryFsProvider();
}
