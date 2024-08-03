import type { PanelLayout, PanelsLayout, RowLayout } from "../types";

export function traverseLayout(layout: PanelsLayout, callback: (panel: PanelLayout & { flex?: number }) => void, reverse = false) {
  switch (layout.type) {
    case "row":
      if (reverse) {
        layout.children.toReversed().forEach((c) => traverseLayout(c, callback, true));
      } else {
        layout.children.forEach((c) => traverseLayout(c, callback));
      }
      break;
    case "file-panel":
    case "quick-view":
      callback(layout);
      break;
  }
}

export function traverseLayoutRows(layout: PanelsLayout, callback: (row: RowLayout) => void, reverse = false) {
  switch (layout.type) {
    case "row":
      callback(layout);
      if (reverse) {
        layout.children.toReversed().forEach((c) => traverseLayoutRows(c, callback, true));
      } else {
        layout.children.forEach((c) => traverseLayoutRows(c, callback));
      }
      break;
  }
}
