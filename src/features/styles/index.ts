import styles from "@assets/styles.css";
import { Theme } from "@features/themes";
import { useLayoutEffect } from "react";

const injectCSS = (css: string) => {
  const el = document.createElement("style");
  el.innerHTML = css;
  document.head.appendChild(el);
  return el;
};

export function useStyles(theme: Theme) {
  useLayoutEffect(() => {
    const colorVariables = Object.entries(theme.colors)
      .concat([["fontFamily", theme.fontFamily]])
      .map(([key, val]) => `--${key.replaceAll(/[.:]/g, "-")}:${val};`)
      .join("\n");
    const frdyColors = `.frdy{${colorVariables}}`;
    const frdyColorsEl = injectCSS(frdyColors);
    const stylesEl = injectCSS(styles);
    return () => {
      frdyColorsEl.remove();
      stylesEl.remove();
    };
  }, [theme]);
}

export function css(className: string, ...options: string[]) {
  if (options.length > 0) {
    return `frdy ${className} ${options.join(" ")}`;
  }
  return `frdy ${className}`;
}
