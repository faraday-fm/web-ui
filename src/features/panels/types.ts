import type { List } from "../../utils/immutableList";
import type { Dirent } from "../fs/types";

export interface CursorPosition {
  activeName?: string;
  activeIndex?: number;
  topmostName?: string;
  topmostIndex?: number;
}

export interface PanelPosition {
  path: string;
  cursor: CursorPosition;
}

export interface PanelState {
  items: List<Dirent>;
  selectedItems: List<string>;
  pos: PanelPosition;
  targetPos?: PanelPosition;
  stack: PanelPosition[];
}
