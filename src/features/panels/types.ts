import { List } from "../../utils/immutableList";
import { FsEntry } from "../fs/types";

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
