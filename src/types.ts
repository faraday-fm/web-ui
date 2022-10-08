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

export type Layout = {

};

export type FarMoreConfig = {
    getLayout(): Promise<Layout>;
    setLayout(layout: Layout): Promise<void>;
};

export type FarMoreFs = {
  listDir(dir: string, extraFields?: string[]): Promise<FsEntry[]>;
  getHomeDir(): Promise<FsEntry>;
  getDirSeparator(): Promise<string>;
  normalisePath(path: string): Promise<string>;
};

export type TerminalSession = Symbol;

export type FarMoreTerminal = {
  createSession(command: string, cwd: string, onData: (data: Uint8Array) => void, initialTtySize: { rows: number; cols: number }): Promise<TerminalSession>;
  destroySession(session: TerminalSession): Promise<void>;
  setTtySize(session: TerminalSession, size: { rows: number; cols: number }): Promise<void>;
  sendData(session: TerminalSession, data: string | Uint8Array): Promise<void>;
};

export type FarMoreHost = {
  config: FarMoreConfig;
  fs: FarMoreFs;
  terminal?: FarMoreTerminal;
};
