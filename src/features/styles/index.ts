import { useLayoutEffect, useState } from "react";
import frdyStyles from "../../assets/styles.css";
import type { Theme } from "../../features/themes";

export function useStyles(theme: Theme) {
  const [colorsEl] = useState(() => document.createElement("style"));
  const [stylesEl] = useState(() => document.createElement("style"));

  useLayoutEffect(() => {
    document.head.appendChild(colorsEl);
    return () => colorsEl.remove();
  }, [colorsEl]);

  useLayoutEffect(() => {
    document.head.appendChild(stylesEl);
    return () => stylesEl.remove();
  }, [stylesEl]);

  useLayoutEffect(() => {
    const colorVariables = Object.entries(theme.colors)
      .concat([["fontFamily", theme.fontFamily]])
      .map(([key, val]) => `--${key.replaceAll(/[.:]/g, "-")}:${val};`)
      .join("\n");
    const frdyColors = `.frdy{${colorVariables}}`;
    colorsEl.innerHTML = frdyColors;
    stylesEl.innerHTML = frdyStyles;
  }, [colorsEl, stylesEl, theme]);
}

export function css(className: string, ...options: string[]) {
  if (options.length > 0) {
    return `frdy ${className} ${options.join(" ")}`;
  }
  return `frdy ${className}`;
}
