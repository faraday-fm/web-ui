import isPromise from "is-promise";
import { memo, useEffect, useMemo, useState } from "react";
import { CellText } from "./CellText";
import { CursorStyle } from "./types";
import { useFileIconResolver } from "../../../contexts/fileIconsContext";
import { useGlyphSize } from "../../../contexts/glyphSizeContext";
import { css } from "../../../features/styles";

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
      const iconElement = isPromise(resolvedIcon) ? await resolvedIcon : resolvedIcon;
      if (iconElement) {
        setIcon(iconElement);
      }
    })();
  }, [resolvedIcon]);

  const fullName: string = data?.name ?? "";
  let fileName = fullName;
  let fileExt = "";
  if (!data?.isDir) {
    const dotIdx = fullName.lastIndexOf(".");
    if (dotIdx > 0) {
      fileName = fullName.substring(0, dotIdx);
      fileExt = fullName.substring(dotIdx + 1);
    }
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <div>{icon}</div>
      <span className={css("LineItem")} style={{ lineHeight: `${height}px`, color: getColor(data.name, data?.isDir, cursorStyle === "firm") }}>
        <span className={css("FullFileName")}>
          <CellText cursorStyle={cursorStyle} text={fileName} />
        </span>
        <span className={css("FullFileExt")}>
          <CellText cursorStyle={cursorStyle} text={fileExt} />
        </span>
      </span>
    </>
  );
});
