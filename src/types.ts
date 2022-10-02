export type FsEntry = {
    parent?: FsEntry;
    name: string;
    ext?: string;
    dir?: boolean;
    file?: boolean;
    symlink?: boolean;
    size?: number;
    created?: number;
    accessed?: number;
    modified?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta?: Record<string, any>;
  };
  

export type Fs = {
    listDir: (dir: string) => Promise<FsEntry[]>;
    getRootDir: () => Promise<FsEntry>;
    getHomeDir: () => Promise<FsEntry>;
}

export type FarMoreHost = {
  config: any;
  fs: Fs;
  terminal: any;
};
