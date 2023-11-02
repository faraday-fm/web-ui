/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useRef } from "react";
import { Border } from "../../components/Border";
import { PanelHeader } from "../../components/PanelHeader";
import { useSetContextVariables } from "../../features/commands";
import { useFileContent } from "../../features/fs/hooks";
import { useGlobalContext } from "../../features/globalContext";
import { usePanels } from "../../features/panels";
import { css } from "../../features/styles";
import { useFocused } from "../../hooks/useFocused";
import { QuickViewLayout } from "../../types";
import QuickViewHost from "./QuickViewHost";
import { ContextVariablesProvider, DebugContextVariables } from "../../features/commands/ContextVariablesProvider";

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
  const activePath = useGlobalContext()["filePanel.selectedPath"];

  const panelRootRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(panelRootRef);

  useSetContextVariables("quickView.visible");
  useSetContextVariables("quickView.focus", focused);

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

  const { content, path: contentPath } = useFileContent(activePath, activePath?.endsWith("/.."));

  return (
    <div className={css("QuickView")} ref={panelRootRef} tabIndex={0}>
      <Border color={focused ? "panel-border-focus" : "panel-border"}>
        <div className={css("QuickViewContent")}>
          <PanelHeader active={isActive}>Quick View</PanelHeader>
          <QuickViewHost content={content} path={contentPath} />
        </div>
      </Border>
      <DebugContextVariables />
    </div>
  );
}
