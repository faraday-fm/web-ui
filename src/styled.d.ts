import "styled-components";

import { Border } from "~/src/themes/types";

type Color = CSSProperties["color"];

declare module "styled-components" {
  export interface DefaultTheme {
    filePanel: {
      bg: string;
      color: Color;
      border: Border;
      header: {
        activeBg: Color;
        inactiveBg: Color;
        activeColor: Color;
        inactiveColor: Color;
        extension?: CSSObject;
      };
      content: {
        margin: string;
      };
      footer: {
        bg: Color;
        color: Color;
        extension?: CSSObject;
      };
      fileInfo: {
        border: Border;
      };
      column: {
        bg: Color;
        border: Border;
        extension?: CSSObject;
      };
      extension?: CSSObject;
    };
    modalDialog: {
      bg: Color;
      color: Color;
      border: Border;
      shadow: CSSProperties["boxShadow"];
    };
  }
}
