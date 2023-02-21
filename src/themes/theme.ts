import deepmerge from "deepmerge";
import { DefaultTheme, Palette } from "styled-components";

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

const murenaPalette: Palette = {
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

const darkPalette: Palette = {
  bgColor0: "#002b36",
  bgColor1: "#073642",
  bgColor2: "#008080",
  bgColor3: "#3182a4",
  bgColor4: "#cb4b16",
  bgColor5: "#9c36b6",
  bgColor6: "#859900",
  bgColor7: "#eee8d5",
  fgColor0: "#93a1a1",
  fgColor1: "#268bd2",
  fgColor2: "#4fb636",
  fgColor3: "#2aa198",
  fgColor4: "#dc322f",
  fgColor5: "#d33682",
  fgColor6: "#b58900",
  fgColor7: "#fdf6e3",
};

const lightPalette = {
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

const baseTheme = (colors: Palette): DefaultTheme => ({
  // fontFamily: "Verdana, Geneva, sans-serif",
  fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
  primaryBg: colors.bgColor0,
  primaryText: colors.fgColor0,
  actionsBar: {
    bg: colors.bgColor3,
    color: colors.bgColor0,
    fnKey: {
      color: colors.bgColor7,
    },
  },
  filePanel: {
    bg: colors.bgColor1,
    activeBg: colors.bgColor3,
    color: colors.fgColor2,
    border: {
      color: colors.fgColor3,
      radius: "0",
      thickness: "1px",
      margin: "0.5em calc(0.5ch - 1px)",
      padding: "0",
    },
    header: {
      activeBg: colors.bgColor3,
      inactiveBg: colors.bgColor1,
      activeColor: colors.bgColor1,
      inactiveColor: colors.fgColor2,
      extension: {
        border: `1px solid ${colors.fgColor3}`,
        marginBottom: 1,
      },
    },
    content: { margin: "1px" },
    footer: {
      bg: colors.bgColor1,
      color: colors.fgColor2,
    },
    fileInfo: {
      border: {
        color: colors.fgColor3,
        radius: "0",
        thickness: "1px",
        margin: "1px",
        padding: "1px 1px",
      },
    },
    column: {
      bg: "none",
      color: colors.fgColor6,
      border: {
        color: colors.fgColor3,
        radius: "0",
        thickness: "1px",
        margin: "1px",
        padding: "0",
      },
    },
  },
  modalDialog: {
    bg: colors.fgColor7,
    color: colors.bgColor0,
    border: {
      color: colors.bgColor0,
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
    hotKeyText: colors.fgColor6,
  },
});

export function extend(base: DefaultTheme, extension: RecursivePartial<DefaultTheme>) {
  return deepmerge(base, extension) as DefaultTheme;
}

export const lightTheme = baseTheme(lightPalette);
export const darkTheme = baseTheme(darkPalette);
