import { SynchronousPromise } from "synchronous-promise";
import { FileSystemError } from "./FileSystemError";
import {
  Flags,
  type Dirent,
  FileType,
  type AceMask,
  type AttrFlags,
  type Attrs,
  type DirList,
  type FileHandle,
  type FileSystemProvider,
  type RealPathControlByte,
  type RenameFlags,
  type RequestOptions,
} from "./types";
import { isDir } from "./utils";

type FsEntry = Dirent & {
  content?: Uint8Array;
  children?: FsEntry[];
};

function realpathArray(home: string, path: string) {
  path = path.replaceAll("//", "/");
  if (path.startsWith("/")) {
    home = "/";
    path = path.substring(1);
  }
  if (path.endsWith("/")) {
    path = path.substring(0, path.length - 1);
  }
  if (home.startsWith("/")) {
    home = home.substring(1);
  }
  const pathParts = home
    .split("/")
    .concat(path.split("/"))
    .filter((p) => p);
  let i = 0;
  while (i < pathParts.length) {
    if (pathParts[i] === ".") {
      pathParts.splice(i, 1);
    } else if (pathParts[i] === "..") {
      if (i > 0) {
        i--;
        pathParts.splice(i, 2);
      } else {
        pathParts.splice(i, 1);
      }
    } else {
      i++;
    }
  }
  return pathParts;
}

function realpath(root: string, path: string) {
  return `/${realpathArray(root, path).join("/")}`;
}

export class InMemoryFsProvider implements FileSystemProvider {
  #handles = new Map<string, FsEntry>();
  #root: FsEntry = { attrs: { type: FileType.SSH_FILEXFER_TYPE_DIRECTORY }, filename: "", children: [] };

  #findEntry(path: string): FsEntry {
    const pathArray = realpathArray("/", path);
    let e: FsEntry | undefined = this.#root;
    for (const p of pathArray) {
      if (!e) {
        throw new FileSystemError();
      }
      if (!isDir(e) || !e.children) {
        throw new FileSystemError();
      }
      e = e.children.find((c) => c.filename === p);
    }
    if (!e) {
      throw new FileSystemError();
    }
    return e;
  }

  #findHandle(handle: FileHandle): FsEntry {
    const entry = this.#handles.get(handle);
    if (!entry) {
      throw new FileSystemError();
    }
    return entry;
  }

  #createHandle(entry: FsEntry): FileHandle {
    const handle = crypto.randomUUID();
    this.#handles.set(handle, entry);
    return handle;
  }

  open(filename: string, desiredAccess: AceMask, flags: Flags, attrs: Attrs): Promise<FileHandle> {
    const accessDisposition = flags & Flags.SSH_FXF_ACCESS_DISPOSITION;

    if (accessDisposition === Flags.SSH_FXF_OPEN_EXISTING || accessDisposition === Flags.SSH_FXF_TRUNCATE_EXISTING) {
      const entry = this.#findEntry(filename);
      if (isDir(entry)) {
        throw new FileSystemError();
      }
      if (accessDisposition === Flags.SSH_FXF_TRUNCATE_EXISTING) {
        entry.content = undefined;
      }
      return SynchronousPromise.resolve(this.#createHandle(entry));
    }

    const parts = realpathArray("/", filename);
    if (parts.length === 0) {
      throw new FileSystemError();
    }

    const containingDir = parts.slice(0, parts.length - 1).join("/") || "/";
    const dirEntry = this.#findEntry(containingDir);
    if (!isDir(dirEntry) || !dirEntry.children) {
      throw new FileSystemError();
    }
    const file = parts.at(-1)!;
    const existing = dirEntry.children.find((f) => f.filename === file);
    if (existing) {
      if (accessDisposition === Flags.SSH_FXF_CREATE_NEW) {
        throw new FileSystemError();
      }
      if (accessDisposition === Flags.SSH_FXF_CREATE_TRUNCATE) {
        existing.content = undefined;
      }
      return SynchronousPromise.resolve(this.#createHandle(existing));
    }
    const newEntry = { filename: file, attrs: { ...attrs, type: attrs?.type ?? FileType.SSH_FILEXFER_TYPE_REGULAR } };
    dirEntry.children.push(newEntry);
    return SynchronousPromise.resolve(this.#createHandle(newEntry));
  }

  openDir(path: string): Promise<FileHandle> {
    const entry = this.#findEntry(path);
    if (!isDir(entry)) {
      throw new FileSystemError();
    }
    return SynchronousPromise.resolve(this.#createHandle(entry));
  }

  close(handle: FileHandle): Promise<void> {
    if (!this.#handles.delete(handle)) {
      throw new FileSystemError();
    }
    return SynchronousPromise.resolve();
  }

  read(handle: FileHandle, offset: number, length: number): Promise<Uint8Array> {
    const entry = this.#findHandle(handle);
    if (isDir(entry)) {
      throw new FileSystemError();
    }
    return SynchronousPromise.resolve(entry.content?.slice(offset, offset + length) ?? new Uint8Array());
  }

  readDir(handle: FileHandle): Promise<DirList> {
    const entry = this.#findHandle(handle);
    if (!isDir(entry)) {
      throw new FileSystemError();
    }
    const files = entry.children?.map((c) => ({ filename: c.filename, attrs: c.attrs })) ?? [];
    if (entry !== this.#root) {
      files.unshift({ filename: "..", attrs: entry.attrs });
    }
    return SynchronousPromise.resolve({ files, endOfList: true });
  }

  write(handle: FileHandle, offset: number, data: Uint8Array): Promise<void> {
    const entry = this.#findHandle(handle);
    if (isDir(entry)) {
      throw new FileSystemError();
    }
    if (!entry.content) {
      entry.content = new Uint8Array(offset + data.byteLength);
      entry.content.set(data, offset);
    } else {
      if (entry.content.byteLength < offset + data.byteLength) {
        const prevContent = entry.content;
        entry.content = new Uint8Array(offset + data.byteLength);
        entry.content.set(prevContent, 0);
      }
      entry.content.set(data, offset);
    }
    return SynchronousPromise.resolve();
  }

  async remove(filename: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async rename(oldpath: string, newpath: string, flags: RenameFlags): Promise<void> {
    throw new Error("Method not implemented.");
  }

  mkdir(path: string, attrs: Attrs): Promise<void> {
    const parts = realpathArray("/", path);
    if (parts.length === 0) {
      throw new FileSystemError();
    }
    const containingDir = parts.slice(0, parts.length - 1).join("/") || "/";
    const dirName = parts.at(-1)!;
    const dirEntry = this.#findEntry(containingDir);
    (dirEntry.children ??= []).push({ filename: dirName, children: [], attrs: { ...attrs, type: FileType.SSH_FILEXFER_TYPE_DIRECTORY } });
    return SynchronousPromise.resolve();
  }

  rmdir(path: string): Promise<void> {
    const entry = this.#findEntry(path);
    return SynchronousPromise.resolve();
  }

  stat(path: string, flags: AttrFlags): Promise<Attrs> {
    throw new Error("Method not implemented.");
  }

  lstat(path: string, flags: AttrFlags): Promise<Attrs> {
    throw new Error("Method not implemented.");
  }

  fstat(handle: FileHandle, flags: AttrFlags): Promise<Attrs> {
    const entry = this.#findHandle(handle);
    return SynchronousPromise.resolve(entry.attrs);
  }

  setStat(path: string, attrs: Attrs): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setFstat(handle: FileHandle, attrs: Attrs): Promise<void> {
    const entry = this.#findHandle(handle);
    entry.attrs = attrs;
    return SynchronousPromise.resolve();
  }

  readLink(path: string): Promise<DirList> {
    throw new Error("Method not implemented.");
  }

  link(newLinkPath: string, existingPath: string, symLink: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }

  block(handle: FileHandle, offset: number, length: number, uLockMask: Flags): Promise<void> {
    throw new Error("Method not implemented.");
  }

  unblock(handle: FileHandle, offset: number, length: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  realpath(originalPath: string, controlByte?: RealPathControlByte, composePath?: string[]): Promise<DirList> {
    return SynchronousPromise.resolve({
      files: [{ filename: realpath("/", originalPath), attrs: { type: FileType.SSH_FILEXFER_TYPE_UNKNOWN } }],
      endOfList: true,
    });
  }

  textSeek?(fileHandle: FileHandle, lineNumber: number): Promise<void> {
    const entry = this.#findHandle(fileHandle);
    return SynchronousPromise.resolve();
  }
}
