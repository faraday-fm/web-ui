import { FsEntry } from "@features/fs/types";
import * as L from "list";

export interface CursorPosition {
  selectedName?: string;
  selectedIndex?: number;
  topmostName?: string;
  topmostIndex?: number;
}

export interface PanelState {
  path: string;
  items: L.List<FsEntry>;
  cursor: CursorPosition;
}
