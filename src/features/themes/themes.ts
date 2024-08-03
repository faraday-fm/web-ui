// import deepmerge from "deepmerge";
import type { Theme } from "./types";

// type RecursivePartial<T> = {
//   [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
// };

// const murenaPalette: Palette = {
//   bgColor0: "#000000",
//   bgColor1: "#004164",
//   bgColor2: "#008000",
//   bgColor3: "#008080",
//   bgColor4: "#080000",
//   bgColor5: "#800080",
//   bgColor6: "#008080",
//   bgColor7: "#0c0c0c",
//   fgColor0: "#808080",
//   fgColor1: "#0000ff",
//   fgColor2: "#87c576",
//   fgColor3: "#00ffff",
//   fgColor4: "#ff4b00",
//   fgColor5: "#e68cd7",
//   fgColor6: "#ffff00",
//   fgColor7: "#ffffff",
// };

// const darkPalette: Palette = {
//   bgColor0: "#002b36",
//   bgColor1: "#073642",
//   bgColor2: "#008080",
//   bgColor3: "#3182a4",
//   bgColor4: "#cb4b16",
//   bgColor5: "#9c36b6",
//   bgColor6: "#859900",
//   bgColor7: "#eee8d5",
//   fgColor0: "#93a1a1",
//   fgColor1: "#268bd2",
//   fgColor2: "#4fb636",
//   fgColor3: "#2aa198",
//   fgColor4: "#dc322f",
//   fgColor5: "#d33682",
//   fgColor6: "#b58900",
//   fgColor7: "#fdf6e3",
// };

// const lightPalette = {
//   bgColor0: "#000000",
//   bgColor1: "#004164",
//   bgColor2: "#008000",
//   bgColor3: "#008080",
//   bgColor4: "#080000",
//   bgColor5: "#800080",
//   bgColor6: "#008080",
//   bgColor7: "#0c0c0c",
//   fgColor0: "#808080",
//   fgColor1: "#0000ff",
//   fgColor2: "#87c576",
//   fgColor3: "#00ffff",
//   fgColor4: "#ff4b00",
//   fgColor5: "#e68cd7",
//   fgColor6: "#ffff00",
//   fgColor7: "#ffffff",
// };

export const baseTheme = (): Theme => ({
  // palette: colors,
  fontFamily: "Verdana, Geneva, sans-serif",
  // fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
  colors: {
    focusBorder: "#005cc5",
    foreground: "#d1d5da",
    disabledForeground: "#ff0000",
    descriptionForeground: "#959da5",
    errorForeground: "#f97583",
    "textLink.foreground": "#79b8ff",
    "textLink.activeForeground": "#c8e1ff",
    "textBlockQuote.background": "#24292e",
    "textBlockQuote.border": "#444d56",
    "textCodeBlock.background": "#2f363d",
    "textPreformat.foreground": "#d1d5da",
    "textSeparator.foreground": "#586069",
    "button.background": "#3272bd",
    "button.foreground": "#dcffe4",
    "button.background:hover": "#22863a",
    "button.secondary.background": "#444d56",
    "button.secondary.foreground": "#fff",
    "button.secondary.background:hover": "#586069",
    "button.border": "#ff0000",
    "button.separator": "#ff0000",
    "checkbox.foreground": "#ff0000",
    "checkbox.background": "#444d56",
    "checkbox.border": "#1b1f23",
    "checkbox.background:select": "#ff0000",
    "checkbox.border:select": "#ff0000",
    "actionBar.buttonBackground": "#3272bd",
    "actionBar.buttonForeground": "#dcffe4",
    "actionBar.keyBackground": "#0000",
    "actionBar.keyForeground": "#d1d5da",
    "dialog.backdrop": "#8884",
    "dialog.background": "#c8cfd6",
    "dialog.foreground": "#000000",
    "dialog.border": "#405262",
    "dialog.shadow": "#ff0000",
    "panel.background": "#1c2f40",
    "panel.foreground": "#d1d5da",
    "panel.background:focus": "#203447",
    "panel.border": "#405262",
    "panel.border:focus": "#f6c844",
    "panel.header.background": "#1b3956",
    "panel.header.foreground": "#ffffff",
    "panel.header.background:focus": "#f6c844",
    "panel.header.foreground:focus": "#000000",

    "files.directory.background": "#000000",
    "files.directory.foreground": "#ffffff",
    "files.directory.background:focus": "#16385b",
    "files.directory.foreground:focus": "#ffffff",
    "files.directory.border:focus": "#3272bd",
    "files.file.background": "#000000",
    "files.file.foreground": "#ffffff",
    "files.file.background:focus": "#16385b",
    "files.file.foreground:focus": "#ffffff",
    "files.file.border:focus": "#3272bd",

    "textAcceleratorKey.foreground": "#9a2d2d",
    // "dropdown.background": "#2f363d",
    // "dropdown.border": "#1b1f23",
    // "dropdown.foreground": "#e1e4e8",
    // "dropdown.listBackground": "#24292e",
  },
});

// export function extend(base: Theme, extension: RecursivePartial<Theme>) {
//   return deepmerge(base, extension) as Theme;
// }

export const lightTheme = baseTheme();
export const darkTheme = baseTheme();
