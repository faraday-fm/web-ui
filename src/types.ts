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
  view: FilePanelView;
};

export type ColumnDef = {
  name: string;
  field: string;
  width?: string;
  valueFormatter?: (data: any, value: any) => string;
};

export type FullView = { type: "full"; columnDefs: ColumnDef[] };
export type CondensedView = { type: "condensed"; columnsCount: number; columnDef: ColumnDef };
export type FilePanelView = FullView | CondensedView;

export type PanelLayout = FilePanelLayout;

export type PanelsLayout = (RowLayout | PanelLayout) & { id: string; flex?: number };

export type FarMoreConfig = {
  isDesktop(): boolean;
  // getLayout(): Promise<PanelsLayout>;
  // setLayout(layout: PanelsLayout): Promise<void>;
};

export type Disposable = {
  dispose(): void;
};

export enum FileChangeType {
  Changed = 1,
  Created = 2,
  Deleted = 3,
}

export type FileChangeEvent = {
  type: FileChangeType;
  url: URL;
};

export type FileSystemProvider = {
  watch(url: URL, listener: (events: FileChangeEvent[]) => void, options: { recursive: boolean; excludes: string[] }): Disposable;
  readDirectory(url: URL, signal?: AbortSignal): FsEntry[] | Promise<FsEntry[]>;
  createDirectory(url: URL, signal?: AbortSignal): void | Promise<void>;
  readFile(url: URL, signal?: AbortSignal): Uint8Array | Promise<Uint8Array>;
  writeFile(url: URL, content: Uint8Array, options: { create: boolean; overwrite: boolean }, signal?: AbortSignal): void | Promise<void>;
  delete(url: URL, options: { recursive: boolean }, signal?: AbortSignal): void | Promise<void>;
  rename(oldUrl: URL, newUrl: URL, options: { overwrite: boolean }, signal?: AbortSignal): void | Promise<void>;
  copy?(source: URL, destination: URL, options: { overwrite: boolean }, signal?: AbortSignal): void | Promise<void>;
};

export type TerminalSession = symbol;

export type Terminal = {
  createSession(command: string, cwd: string, onData: (data: Uint8Array) => void, initialTtySize: { rows: number; cols: number }): Promise<TerminalSession>;
  destroySession(session: TerminalSession): Promise<void>;
  setTtySize(session: TerminalSession, size: { rows: number; cols: number }): Promise<void>;
  sendData(session: TerminalSession, data: string | Uint8Array): Promise<void>;
};

export type FarMoreHost = {
  config: FarMoreConfig;
  fs: FileSystemProvider;
  terminal?: Terminal;
};
