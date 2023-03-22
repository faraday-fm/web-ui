import { CursorStyle } from "./types";

export function CellText({ text, cursorStyle }: { text: unknown; cursorStyle: CursorStyle }) {
  return <span>{String(text)}</span>;
}
