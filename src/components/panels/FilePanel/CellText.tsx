import type { CursorStyle } from "./types";

export function CellText({ text }: { text: unknown; cursorStyle: CursorStyle }) {
  return <span>{String(text)}</span>;
}
