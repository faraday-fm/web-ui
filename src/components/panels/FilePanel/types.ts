import { FsEntry } from "@types";

export type ColumnDef = {
  name: string;
  field: string;
  width?: string;
  valueFormatter?: (data: any, value: any) => string;
};

type ScrollAction = { type: "scroll"; delta: number; followCursor: boolean };
type MoveCursorToPosAction = { type: "moveCursorToPos"; pos: number };
type MoveCursorLeftRightAction = { type: "moveCursorLeftRight"; direction: "left" | "right" };
type MoveCursorPageAction = { type: "moveCursorPage"; direction: "up" | "down" };
type ResizeAction = { type: "resize"; maxItemsPerColumn: number };
type SetItemsAction = { type: "setItems"; items: FsEntry[] };
type SetColumnsCountAction = { type: "setColumnsCount"; count: number };
type FindFirstAction = { type: "findFirst"; char: string };

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
