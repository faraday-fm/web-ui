import { DefaultTheme } from "styled-components";

import { extend, lightTheme } from "./theme";

const farTheme = (t: DefaultTheme) => {
  return extend(t, {
    filePanel: {
      border: { radius: 0 },
      header: {
        extension: {
          border: "none",
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translate(-50%, 0)",
          padding: "0 0.5ch",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "calc(100% - 2em)",
          textAlign: "left",
          zIndex: "1",
        },
      },
      content: {
        extension: {
          gridTemplateRows: "1fr auto auto",
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
        border: {
          radius: 0,
          margin: "0",
          extension: {
            borderRight: "0",
            borderBottom: "0",
            "&:last-child": {
              borderRight: `1px solid ${t.palette.fgColor3}`,
            },
          },
        },
      },
    },
  });
};

export const theme = farTheme(lightTheme);
