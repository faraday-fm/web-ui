import { FileSystemProvider } from "@features/fs/types";

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
};

export type FullView = { type: "full"; columnDefs: ColumnDef[] };
export type CondensedView = { type: "condensed"; columnDef: ColumnDef };
export type FilePanelView = FullView | CondensedView;

export type QuickViewLayout = {
  type: "quick-view";
};

export type PanelLayout = FilePanelLayout | QuickViewLayout;

export type PanelsLayout = (RowLayout | PanelLayout) & { id: string; flex?: number; when?: string };

export type FarMoreConfig = {
  isDesktop(): boolean;
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
  farMoreFs: FileSystemProvider;
  rootFs: FileSystemProvider;
  terminal?: Terminal;
};

export type FarMoreProps = {
  host: FarMoreHost;
};
