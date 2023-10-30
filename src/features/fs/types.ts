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

export interface FileSystemProvider {
  watchDir(path: string, watcher: FileSystemWatcher, options?: { signal?: AbortSignal }): Promise<void>;
  watchFile(path: string, watcher: FileSystemWatcher, options?: { signal?: AbortSignal }): Promise<void>;
  readDirectory(path: string, options?: { signal?: AbortSignal }): Promise<FsEntry[]>;
  createDirectory(path: string, options?: { signal?: AbortSignal }): Promise<void>;
  readFile(path: string, options?: { signal?: AbortSignal }): Promise<Uint8Array>;
  writeFile(path: string, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean; signal?: AbortSignal }): Promise<void>;
  delete(path: string, options?: { recursive?: boolean; signal?: AbortSignal }): Promise<void>;
  rename(oldPath: string, newPath: string, options?: { overwrite?: boolean; signal?: AbortSignal }): Promise<void>;
  copy?(source: string, destination: string, options?: { overwrite?: boolean; signal?: AbortSignal }): Promise<void>;
  mount?(path: string, fs: FileSystemProvider): Promise<void>;
}
