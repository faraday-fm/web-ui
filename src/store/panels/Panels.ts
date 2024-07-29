import { state } from "effie";
import { produce } from "immer";
import JSON5 from "json5";
import { useCallback, useEffect, useState } from "react";
import defaultLayout from "../../assets/layout.json5";
import { FsEntry } from "../../features/fs/types";
import { useFileContent } from "../../features/fs/useFileContent";
import { FilePanelLayout, PanelLayout, PanelsLayout } from "../../types";
import { List } from "../../utils/immutableList";
import { traverseLayout, traverseLayoutRows } from "../../utils/layout";
import { combine, truncateLastDir } from "../../utils/path";
import { CursorPosition, PanelState } from "./types";

const decoder = new TextDecoder();

export function Panels() {
  const { content: layoutContent } = useFileContent("faraday:/layout.json5");

  const [activePanel, setActivePanel] = useState<PanelLayout>();
  const [activeFilePanel, setActiveFilePanel] = useState<FilePanelLayout>();
  const [layout, setLayout] = useState<PanelsLayout>();
  const [states, setStates] = useState<Record<string, PanelState | undefined>>({});

  useEffect(() => {
    if (layoutContent) {
      try {
        const layout: PanelsLayout = JSON5.parse(decoder.decode(layoutContent));
        setLayout(layout);
      } catch {
        setLayout(JSON5.parse(defaultLayout));
      }
    }
  }, [layoutContent, setLayout]);

  return state({
    activePanel,
    activeFilePanel,
    layout,
    states,

    resizeChildren: useCallback(
      (id: string, flexes: number[]) => {
        if (layout) {
          const newLayout = produce(layout, (l) => {
            traverseLayoutRows(l, (panel) => {
              if (panel.id === id) {
                panel.children.forEach((child, idx) => (child.flex = flexes[idx]));
              }
            });
          });
          setLayout(newLayout);
        }
      },
      [layout]
    ),
    setActivePanel: useCallback(
      (activePanelId: string) => {
        if (layout) {
          traverseLayout(layout, (panel) => {
            if (panel.id === activePanelId) {
              setActivePanel(panel);
              if (panel.type === "file-panel") {
                setActiveFilePanel(panel);
              }
            }
          });
        }
      },
      [layout]
    ),
    initFilePanelState: useCallback((id: string, state: PanelState) => {
      setStates((s) => {
        if (!s[id]) {
          return produce(s, (s) => {
            if (!s[id]) {
              s[id] = state;
            }
          });
        } else {
          return s;
        }
      });
    }, []),
    setPanelItems: useCallback((id: string, items: List<FsEntry>) => {
      setStates((s) =>
        produce(s, (s) => {
          const state = s[id];
          if (!state?.targetPos) {
            return;
          }
          state.items = items;
          state.pos = state.targetPos;
          state.stack.push(state.pos);
        })
      );
    }, []),
    setPanelCursorPos: useCallback((id: string, cursorPos: CursorPosition) => {
      setStates((s) =>
        produce(s, (s) => {
          const state = s[id];
          if (!state) {
            return;
          }
          state.pos.cursor = cursorPos;
          const pos = state.stack.at(-1);
          if (pos) {
            pos.cursor = cursorPos;
          }
        })
      );
    }, []),
    focusNextPanel: useCallback(
      (backward: boolean) => {
        if (layout) {
          let lastTraversedPanel: PanelLayout | undefined;
          let newActivePanel: PanelLayout | undefined;
          traverseLayout(
            layout,
            (panel) => {
              if (lastTraversedPanel && !newActivePanel && panel.id === activePanel?.id) {
                setActivePanel(lastTraversedPanel);
                newActivePanel = lastTraversedPanel;
              }
              lastTraversedPanel = panel;
            },
            !backward
          );
          if (!newActivePanel && lastTraversedPanel) {
            setActivePanel(lastTraversedPanel);
          }
          if (newActivePanel?.type === "file-panel") {
            setActiveFilePanel(newActivePanel);
          }
        }
      },
      [activePanel?.id, layout]
    ),
    enterDir: useCallback(() => {
      if (!activeFilePanel) {
        return;
      }
      setStates((s) =>
        produce(s, (s) => {
          const state = s[activeFilePanel.id];
          if (!state) {
            return;
          }

          const cursor = state.stack.at(-1);
          const selectedItemPos = cursor?.cursor.selectedIndex ?? 0;
          const selectedItem = state.items.get(selectedItemPos);
          if (selectedItem?.isDir) {
            if (selectedItem.name === "..") {
              const targetPath = truncateLastDir(state.pos.path);
              if (targetPath === state.pos.path) {
                return;
              }
              state.stack.pop();
              const targetPos = state.stack.pop();
              state.targetPos = { path: targetPath, cursor: targetPos?.cursor ?? {} };
            } else {
              state.targetPos = { path: combine(state.pos.path, selectedItem.name), cursor: {} };
            }
          }
        })
      );
    }, [activeFilePanel]),
    dirUp: useCallback((id: string) => {
      setStates((s) =>
        produce(s, (s) => {
          const state = s[id];
          if (!state) {
            return;
          }

          const targetPath = truncateLastDir(state.pos.path);
          if (targetPath === state.pos.path) {
            return;
          }
          state.stack.pop();
          const targetPos = state.stack.pop();
          state.targetPos = { path: targetPos?.path ?? targetPath, cursor: targetPos?.cursor ?? {} };
        })
      );
    }, []),
  });
}
