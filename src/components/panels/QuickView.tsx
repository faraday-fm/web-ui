/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useRef } from "react";
import { Border } from "../../components/Border";
import { PanelHeader } from "../../components/PanelHeader";
import { ContextVariablesProvider, DebugContextVariables, useSetContextVariables } from "../../features/commands";
import { useFileContent } from "../../features/fs/hooks";
import { css } from "../../features/styles";
import { useFocused } from "../../hooks/useFocused";
import { useGlobalContext } from "../../store/globalContext";
import { usePanels } from "../../store/panels/hooks";
import { QuickViewLayout } from "../../types";
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

export function QuickView({ layout }: QuickViewPanelProps) {
  const { id } = layout;
  const { activePanel, setActivePanel } = usePanels();
  const isActive = activePanel?.id === id;
  const { context } = useGlobalContext();
  const { "filePanel.path": path, "filePanel.isFileSelected": isFileSelected } = context;

  const panelRootRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(panelRootRef);

  useSetContextVariables("quickView.visible");
  useSetContextVariables("quickView.focus", isActive);

  useEffect(() => {
    if (focused) {
      setActivePanel(id);
    }
  }, [id, focused, setActivePanel]);

  useEffect(() => {
    if (isActive) {
      panelRootRef.current?.focus();
    }
  }, [isActive]);

  // const { content, path: contentPath } = useFileContent(path, !isFileSelected);
  const { content, path: contentPath } = { content: undefined, path: undefined };

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
}
