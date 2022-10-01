import deepmerge from "deepmerge";
import { DefaultTheme } from "styled-components";

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

const murenaPalette = {
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

const darkPalette = {
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
  bgColor0: "white",
  bgColor1: "white",
  bgColor2: "white",
  bgColor3: "#3182a4",
  bgColor4: "white",
  bgColor5: "white",
  bgColor6: "white",
  bgColor7: "white",
  fgColor0: "black",
  fgColor1: "black",
  fgColor2: "black",
  fgColor3: "#d8d8d8",
  fgColor4: "black",
  fgColor5: "black",
  fgColor6: "black",
  fgColor7: "black",
};

const murenaColors = {
  filePanelBg: murenaPalette.bgColor1,
  filePanelText: murenaPalette.fgColor3,
  filePanelBorder: murenaPalette.fgColor3,
  filePanelCursorBg: murenaPalette.bgColor3,
};

const darkColors = {
  filePanelBg: darkPalette.bgColor1,
  filePanelText: darkPalette.fgColor3,
  filePanelBorder: darkPalette.fgColor3,
  filePanelCursorBg: darkPalette.bgColor3,
};

const lightColors = {
  filePanelBg: lightPalette.bgColor1,
  filePanelText: lightPalette.fgColor2,
  filePanelBorder: lightPalette.fgColor3,
  filePanelCursorBg: lightPalette.bgColor3,
};

const baseTheme = (colors: typeof darkColors): DefaultTheme => ({
  filePanel: {
    bg: colors.filePanelBg,
    color: colors.filePanelText,
    border: {
      color: colors.filePanelBorder,
      radius: "0",
      thickness: "1px",
      margin: "0.5em calc(0.25em - 1px)",
      padding: "none",
    },
    header: {
      activeBg: colors.filePanelCursorBg,
      inactiveBg: colors.filePanelBg,
      activeColor: colors.filePanelBg,
      inactiveColor: colors.filePanelText,
      extension: {
        border: `1px solid ${colors.filePanelBorder}`,
        marginBottom: 1,
      },
    },
    content: { margin: "1px" },
    footer: {
      bg: colors.filePanelBg,
      color: colors.filePanelText,
    },
    fileInfo: {
      border: {
        color: colors.filePanelBorder,
        radius: "3px",
        thickness: "1px",
        margin: "1px",
        padding: "1px 1px",
      },
    },
    column: {
      bg: "none",
      border: {
        color: colors.filePanelBorder,
        radius: "3px",
        thickness: "1px",
        margin: "1px",
        padding: "none",
      },
    },
  },
  modalDialog: {
    bg: colors.filePanelBorder,
    color: colors.filePanelBorder,
    border: { color: colors.filePanelBorder, radius: "1px", thickness: "1px", margin: "none", padding: "none" },
    shadow: "none",
  },
});

export function extend(base: DefaultTheme, extension: RecursivePartial<DefaultTheme>) {
  return deepmerge(base, extension) as DefaultTheme;
}

export const theme = baseTheme(murenaColors);
// export const theme = farTheme(baseTheme(murenaColors));
