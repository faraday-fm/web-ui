import { List } from "../../utils/immutableList";
import { FsEntry } from "../fs/types";

export interface CursorPosition {
  selectedName?: string;
  selectedIndex?: number;
  topmostName?: string;
  topmostIndex?: number;
}

export interface PanelPosition {
  path: string;
  cursor: CursorPosition;
}

export interface PanelState {
  items: List<FsEntry>;
  pos: PanelPosition;
  targetPos?: PanelPosition;
  stack: PanelPosition[];
}
