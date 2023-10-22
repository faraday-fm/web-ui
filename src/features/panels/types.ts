import { FsEntry } from "@features/fs/types";
import { List } from "list";

export interface CursorPosition {
  selectedName?: string;
  selectedIndex?: number;
  topmostName?: string;
  topmostIndex?: number;
}

export interface PanelState {
  path: string;
  items: List<FsEntry>;
  cursor: CursorPosition;
}
