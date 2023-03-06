import { DefaultTheme } from "styled-components";

import { applyPalette, extend, lightPalette, lightTheme } from "./theme";

const forkliftTheme = (t: DefaultTheme) => {
  return extend(t, {
    fontFamily: "system-ui, -apple-system",
    fontSize: "12px",
    filePanel: {
      color: "$fg0",
      border: { radius: 0 },
      header: {
        activeColor: "$fg0",
        activeBg: "#a1abbe",
        inactiveColor: "$fg0",
        inactiveBg: "$bg0",
        extension: {
          border: "none",
          borderBottom: "1px solid #949dae",
          marginBottom: 0,
        },
      },
      content: {
        extension: {
          background: "#ffffff",
          border: "none",
          // gridTemplateRows: "1fr auto auto",
        },
      },
      footer: {
        extension: {
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translate(-50%, 0)",
          maxWidth: "calc(100% - 2em)",
          zIndex: 1,
        },
      },
      fileInfo: {
        border: { margin: "0", radius: 0 },
      },
      column: {
        color: "black",
        border: {
          radius: 0,
          margin: "0",
          extension: {
            border: "none",
          },
        },
        header: {
          extension: {
            padding: "5px 0",
            borderBottom: "1px solid #dcdcdc",
          },
        },
        extension: {
          padding: "0",
        },
      },
    },
  });
};

export const theme = applyPalette(forkliftTheme(lightTheme), lightPalette);
