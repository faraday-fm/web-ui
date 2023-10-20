import { FsEntry } from "@features/fs/types";

export interface ColumnDef {
  name: string;
  field: string;
  width?: string;
  valueFormatter?: (data: unknown, value: unknown) => string;
}

interface ScrollAction {
  type: "scroll";
  delta: number;
  followCursor: boolean;
}
interface MoveCursorToPosAction {
  type: "moveCursorToPos";
  pos: number;
}
interface MoveCursorLeftRightAction {
  type: "moveCursorLeftRight";
  direction: "left" | "right";
}
interface MoveCursorPageAction {
  type: "moveCursorPage";
  direction: "up" | "down";
}
interface ResizeAction {
  type: "resize";
  maxItemsPerColumn: number;
}
interface SetItemsAction {
  type: "setItems";
  items: FsEntry[];
}
interface SetColumnsCountAction {
  type: "setColumnsCount";
  count: number;
}
interface FindFirstAction {
  type: "findFirst";
  char: string;
}

export type FilePanelAction =
  | ScrollAction
  | MoveCursorToPosAction
  | MoveCursorLeftRightAction
  | MoveCursorPageAction
  | ResizeAction
  | SetItemsAction
  | SetColumnsCountAction
  | FindFirstAction;

export type CursorStyle = "firm" | "inactive" | "hidden";
