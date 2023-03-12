export type FsEntry = {
  name: string;
  ext?: string;
  isDir?: boolean;
  isFile?: boolean;
  isSymlink?: boolean;
  isBlockDevice?: boolean;
  isCharacterDevice?: boolean;
  isFIFO?: boolean;
  isSocket?: boolean;
  size?: number;
  created?: number;
  accessed?: number;
  modified?: number;
};

export type FileChangeType = "changed" | "created" | "deleted";

export type FileChangeEvent = { type: FileChangeType; path: string; entry: FsEntry } | { type: "ready" };

export type FileSystemWatcher = (events: FileChangeEvent[]) => void;

export type FileSystemProvider = {
  watch(path: string, watcher: FileSystemWatcher, options?: { recursive?: boolean; excludes?: string[]; signal?: AbortSignal }): void | Promise<void>;
  readDirectory(path: string, options?: { signal?: AbortSignal }): FsEntry[] | Promise<FsEntry[]>;
  createDirectory(path: string, options?: { signal?: AbortSignal }): void | Promise<void>;
  readFile(path: string, options?: { signal?: AbortSignal }): Uint8Array | Promise<Uint8Array>;
  writeFile(path: string, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean; signal?: AbortSignal }): void | Promise<void>;
  delete(path: string, options?: { recursive?: boolean; signal?: AbortSignal }): void | Promise<void>;
  rename(oldPath: string, newPath: string, options?: { overwrite?: boolean; signal?: AbortSignal }): void | Promise<void>;
  copy?(source: string, destination: string, options?: { overwrite?: boolean; signal?: AbortSignal }): void | Promise<void>;
  mount?(path: string, fs: FileSystemProvider): void | Promise<void>;
};
