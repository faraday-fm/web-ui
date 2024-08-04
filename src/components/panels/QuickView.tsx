/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { memo, useEffect, useRef } from "react";
import { Border } from "../../components/Border";
import { PanelHeader } from "../../components/PanelHeader";
import { ContextVariablesProvider, DebugContextVariables, useSetContextVariables } from "../../features/commands";
import { useFileContent } from "../../features/fs/hooks";
import { useGlobalContext } from "../../features/globalContext";
import { usePanels } from "../../features/panels";
import { css } from "../../features/styles";
import { useFocused } from "../../hooks/useFocused";
import type { QuickViewLayout } from "../../types";
import QuickViewHost from "./QuickViewHost";

interface QuickViewPanelProps {
  layout: QuickViewLayout & { id: string };
}

export function QuickViewPanel({ layout }: QuickViewPanelProps) {
  return (
    <ContextVariablesProvider>
      <QuickView layout={layout} />
    </ContextVariablesProvider>
  );
}

export const QuickView = memo(({ layout }: QuickViewPanelProps) => {
  const { id } = layout;
  const { activePanel, setActivePanelId } = usePanels();
  const isActive = activePanel?.id === id;
  const {
    globalContext: { "filePanel.path": path, "filePanel.isFileActive": isFileActive },
  } = useGlobalContext();

  const panelRootRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(panelRootRef);

  useSetContextVariables("quickView.visible");
  useSetContextVariables("quickView.focus", isActive);

  useEffect(() => {
    if (focused) {
      setActivePanelId(id);
    }
  }, [id, focused, setActivePanelId]);

  useEffect(() => {
    if (isActive) {
      panelRootRef.current?.focus();
    }
  }, [isActive]);

  const { content, path: contentPath } = useFileContent(path, !isFileActive);

  return (
    <div className={css("quick-view")} ref={panelRootRef} tabIndex={0}>
      <Border color={focused ? "panel-border-focus" : "panel-border"}>
        <div className={css("quick-view-content")}>
          <PanelHeader active={isActive}>Quick View</PanelHeader>
          <QuickViewHost content={content} path={contentPath} />
        </div>
      </Border>
      <DebugContextVariables />
    </div>
  );
});
