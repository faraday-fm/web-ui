export type FsEntry = {
  name: string;
  ext?: string;
  isDir?: boolean;
  isFile?: boolean;
  isSymlink?: boolean;
  size?: number;
  created?: number;
  accessed?: number;
  modified?: number;
};

export type FileChangeType = "changed" | "created" | "deleted";

export type FileChangeEvent = { type: FileChangeType; url: string; entry: FsEntry } | { type: "ready" };

export type FileSystemProvider = {
  watch(
    url: string,
    listener: (events: FileChangeEvent[]) => void,
    options: { recursive: boolean; excludes: string[] },
    signal?: AbortSignal
  ): void | Promise<void>;
  readDirectory(url: string, signal?: AbortSignal): FsEntry[] | Promise<FsEntry[]>;
  createDirectory(url: string, signal?: AbortSignal): void | Promise<void>;
  readFile(url: string, signal?: AbortSignal): Uint8Array | Promise<Uint8Array>;
  writeFile(url: string, content: Uint8Array, options: { create: boolean; overwrite: boolean; signal?: AbortSignal }): void | Promise<void>;
  delete(url: string, options: { recursive: boolean; signal?: AbortSignal }): void | Promise<void>;
  rename(oldUrl: string, newUrl: string, options: { overwrite: boolean; signal?: AbortSignal }): void | Promise<void>;
  copy?(source: string, destination: string, options: { overwrite: boolean; signal?: AbortSignal }): void | Promise<void>;
};
