import isPromise from "is-promise";
import { memo, useEffect, useMemo, useState } from "react";
import { useFileIconResolver } from "../../../contexts/fileIconsContext";
import { useGlyphSize } from "../../../contexts/glyphSizeContext";
import { css } from "../../../features/styles";
import { CellText } from "./CellText";
import type { CursorStyle } from "./types";

interface CellProps {
  cursorStyle: CursorStyle;
  data?: { name: string; isDir?: boolean | undefined };
}

function getColor(name: string, dir: boolean | undefined, selected: boolean) {
  if (dir) return selected ? "var(--files-directory-foreground-focus)" : "var(--files-directory-foreground";
  // if (name.startsWith(".")) return selected ? "var(--color-01)" : "var(--color-02)";
  // if (name.endsWith(".toml") || name.endsWith(".json")) return selected ? "var(--color-01)" : "var(--color-10)";
  return selected ? "var(--files-file-foreground-focus)" : "var(--files-file-foreground)";
}

export const FullFileName = memo(function FullFileName({ cursorStyle, data }: CellProps) {
  const iconResolver = useFileIconResolver();
  const { height } = useGlyphSize();

  const resolvedIcon = useMemo(() => iconResolver(data?.name ?? "", data?.isDir ?? false) ?? null, [data, iconResolver]);

  const emptyIcon = <div style={{ width: 17 }} />;
  const [icon, setIcon] = useState(!isPromise(resolvedIcon) ? resolvedIcon ?? emptyIcon : emptyIcon);

  useEffect(() => {
    void (async () => {
      const iconElement = isPromise(resolvedIcon) ? <>{await resolvedIcon}</> : resolvedIcon;
      if (iconElement) {
        setIcon(iconElement);
      }
    })();
  }, [resolvedIcon]);

  const name: string = data?.name ?? "";

  if (!data) {
    return null;
  }

  return (
    <>
      <div>{icon}</div>
      <span
        className={css("line-item")}
        style={{
          lineHeight: `${height}px`,
          color: getColor(data.name, data?.isDir, cursorStyle === "firm"),
        }}
      >
        <span className={css("file-name")}>
          <CellText cursorStyle={cursorStyle} text={name} />
        </span>
      </span>
    </>
  );
});
