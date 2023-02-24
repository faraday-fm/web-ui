import { PanelLayout, PanelsLayout } from "@types";

export function traverseLayout(layout: PanelsLayout, callback: (panel: PanelLayout & { id: string; flex?: number }) => void, reverse = false) {
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
      callback(layout);
  }
}
