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

export type RowLayout = {
  type: "row";
  children: PanelsLayout[];
};

export type FilePanelLayout = {
  type: "file-panel";
  path: string;
  topmostFileName?: string;
  selectedFileName?: string;
};

export type PanelLayout = FilePanelLayout;

export type PanelsLayout = (RowLayout | PanelLayout) & { id: string; flex?: number };

export type FarMoreConfig = {
  isDesktop(): boolean;
  getLayout(): Promise<PanelsLayout>;
  setLayout(layout: PanelsLayout): Promise<void>;
};

export type FarMoreFs = {
  listDir(dir: string, extraFields?: string[]): Promise<FsEntry[]>;
  getHomeDir(): Promise<string>;
  getDirSeparator(): Promise<string>;
  normalizePath(path: string): Promise<string>;
};

export type TerminalSession = symbol;

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
