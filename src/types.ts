import { FileSystemProvider } from "./features/fs/types";

export interface RowLayout {
  id: string;
  type: "row";
  children: PanelsLayout[];
}

export interface FilePanelLayout {
  id: string;
  type: "file-panel";
  path: string;
  view: FilePanelView;
}

export interface ColumnDef {
  name: string;
  field: string;
  width?: string;
}

export interface FullView {
  type: "full";
  columnDefs: ColumnDef[];
}
export interface CondensedView {
  type: "condensed";
}
export type FilePanelView = FullView | CondensedView;

export interface QuickViewLayout {
  id: string;
  type: "quick-view";
}

export type PanelLayout = FilePanelLayout | QuickViewLayout;

export type PanelsLayout = (RowLayout | PanelLayout) & { id: string; flex?: number; when?: string };

export interface FaradayConfig {
  isDesktop(): boolean;
}

export type TerminalSession = symbol;

export interface Terminal {
  createSession(command: string, cwd: string, onData: (data: Uint8Array) => void, initialTtySize: { rows: number; cols: number }): Promise<TerminalSession>;
  destroySession(session: TerminalSession): Promise<void>;
  setTtySize(session: TerminalSession, size: { rows: number; cols: number }): Promise<void>;
  sendData(session: TerminalSession, data: string | Uint8Array): Promise<void>;
}

export interface FaradayHost {
  config: FaradayConfig;
  faradayFs: FileSystemProvider;
  rootFs: FileSystemProvider;
  terminal?: Terminal;
}

export interface FaradayProps {
  host: FaradayHost;
}
