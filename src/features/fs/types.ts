export type FsEntry = Record<string, unknown> & {
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

type Result<T> = Promise<T>;

export interface FileSystemProvider {
  watchDir(path: string, watcher: FileSystemWatcher, options?: { signal?: AbortSignal }): Result<void>;
  watchFile(path: string, watcher: FileSystemWatcher, options?: { signal?: AbortSignal }): Result<void>;
  readDirectory(path: string, options?: { signal?: AbortSignal }): Result<FsEntry[]>;
  createDirectory(path: string, options?: { signal?: AbortSignal }): Result<void>;
  readFile(path: string, options?: { signal?: AbortSignal }): Result<Uint8Array>;
  writeFile(path: string, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean; signal?: AbortSignal }): Result<void>;
  delete(path: string, options?: { recursive?: boolean; signal?: AbortSignal }): Result<void>;
  rename(oldPath: string, newPath: string, options?: { overwrite?: boolean; signal?: AbortSignal }): Result<void>;
  copy?(source: string, destination: string, options?: { overwrite?: boolean; signal?: AbortSignal }): Result<void>;
  mount?(path: string, fs: FileSystemProvider): Result<void>;
}
