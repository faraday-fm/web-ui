import deepmerge from "deepmerge";
import { DefaultTheme, Palette } from "styled-components";

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

export const darkPalette: Palette = {
  bgColor0: "#000000",
  bgColor1: "#004164",
  bgColor2: "#008000",
  bgColor3: "#008080",
  bgColor4: "#080000",
  bgColor5: "#800080",
  bgColor6: "#008080",
  bgColor7: "#0c0c0c",
  fgColor0: "#808080",
  fgColor1: "#0000ff",
  fgColor2: "#87c576",
  fgColor3: "#00ffff",
  fgColor4: "#ff4b00",
  fgColor5: "#e68cd7",
  fgColor6: "#ffff00",
  fgColor7: "#ffffff",
};

export const lightPalette = {
  bgColor0: "#ffffff",
  bgColor1: "#004164",
  bgColor2: "#008000",
  bgColor3: "#008080",
  bgColor4: "#080000",
  bgColor5: "#800080",
  bgColor6: "#008080",
  bgColor7: "#0c0c0c",
  fgColor0: "#000000",
  fgColor1: "#0000ff",
  fgColor2: "#87c576",
  fgColor3: "#000000",
  fgColor4: "#ff4b00",
  fgColor5: "#e68cd7",
  fgColor6: "#ffff00",
  fgColor7: "#000000",
};

const baseTheme: DefaultTheme = {
  // fontFamily: "Verdana, Geneva, sans-serif",
  fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
  fontSize: "16px",
  primaryBg: "$bg0",
  primaryText: "$fg0",
  actionsBar: {
    bg: "$bg3",
    color: "$bg0",
    fnKey: {
      color: "$bg7",
    },
  },
  filePanel: {
    bg: "$bg1",
    activeBg: "$bg3",
    color: "$fg2",
    border: {
      color: "$fg3",
      radius: "0",
      thickness: "1px",
      margin: "0.5em calc(0.5ch - 1px)",
      padding: "0",
    },
    header: {
      activeBg: "$bg3",
      inactiveBg: "$bg1",
      activeColor: "$bg0",
      inactiveColor: "$fg3",
      extension: {
        border: `1px solid $fg3`,
        marginBottom: 1,
      },
    },
    entries: {
      dir: { activeColor: "$fg7", inactiveColor: "$fg7" },
      file: { activeColor: "$bg0", inactiveColor: "$fg3" },
    },
    content: { margin: "1px" },
    footer: {
      bg: "$bg1",
      color: "$fg2",
    },
    fileInfo: {
      border: {
        color: "$fg3",
        radius: "0",
        thickness: "1px",
        margin: "1px",
        padding: "1px 1px",
      },
    },
    column: {
      header: {
        bg: "none",
        color: "$fg6",
      },
      bg: "none",
      color: "$fg6",
      border: {
        color: "$fg3",
        radius: "0",
        thickness: "1px",
        margin: "1px",
        padding: "0",
      },
    },
  },
  modalDialog: {
    bg: "$fg7",
    color: "$bg0",
    border: {
      color: "$bg0",
      radius: "0",
      thickness: "1px",
      margin: "0",
      padding: "1px",
      extension: {
        borderBottomWidth: 0,
        "&:last-child": {
          borderBottomWidth: "1px",
        },
      },
    },
    backdropColor: "#0003",
    shadow: "1rem 1rem 0 0 rgb(0 0 0 / 40%)",
  },
  misc: {
    hotKeyText: "$fg6",
  },
};

export function extend(base: DefaultTheme, extension: RecursivePartial<DefaultTheme>) {
  return deepmerge(base, extension) as DefaultTheme;
}

export function applyPalette(theme: DefaultTheme, palette: Palette) {
  let themeStr = JSON.stringify(theme);
  themeStr = themeStr
    .replaceAll("$bg0", palette.bgColor0)
    .replaceAll("$bg1", palette.bgColor1)
    .replaceAll("$bg2", palette.bgColor2)
    .replaceAll("$bg3", palette.bgColor3)
    .replaceAll("$bg4", palette.bgColor4)
    .replaceAll("$bg5", palette.bgColor5)
    .replaceAll("$bg6", palette.bgColor6)
    .replaceAll("$bg7", palette.bgColor7)
    .replaceAll("$fg0", palette.fgColor0)
    .replaceAll("$fg1", palette.fgColor1)
    .replaceAll("$fg2", palette.fgColor2)
    .replaceAll("$fg3", palette.fgColor3)
    .replaceAll("$fg4", palette.fgColor4)
    .replaceAll("$fg5", palette.fgColor5)
    .replaceAll("$fg6", palette.fgColor6)
    .replaceAll("$fg7", palette.fgColor7);
  return JSON.parse(themeStr);
}

export const lightTheme = applyPalette(baseTheme, lightPalette);
export const darkTheme = applyPalette(baseTheme, darkPalette);
