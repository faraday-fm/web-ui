import { PanelLayout, PanelsLayout } from "../types";

export function traverseLayout(layout: PanelsLayout, callback: (panel: PanelLayout & { flex?: number }) => void, reverse = false) {
  switch (layout.type) {
    case "row":
      if (reverse) {
        layout.children
          .slice()
          .reverse()
          .forEach((c) => traverseLayout(c, callback, true));
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
