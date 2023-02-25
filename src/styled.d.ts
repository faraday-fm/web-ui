import "styled-components";

import { Border } from "@themes/types";

type Color = CSSProperties["color"];
type BoxShadow = CSSProperties["boxShadow"];

declare module "styled-components" {
  export type Palette = {
    bgColor0: Color;
    bgColor1: Color;
    bgColor2: Color;
    bgColor3: Color;
    bgColor4: Color;
    bgColor5: Color;
    bgColor6: Color;
    bgColor7: Color;
    fgColor0: Color;
    fgColor1: Color;
    fgColor2: Color;
    fgColor3: Color;
    fgColor4: Color;
    fgColor5: Color;
    fgColor6: Color;
    fgColor7: Color;
  };

  export interface DefaultTheme {
    palette: Palette;
    fontFamily: string;
    primaryBg: Color;
    primaryText: Color;
    actionsBar: {
      bg: Color;
      color: Color;
      fnKey: {
        color: Color;
        extension?: CSSObject;
      };
    };
    filePanel: {
      bg: Color;
      activeBg: Color;
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
        extension?: CSSObject;
      };
      footer: {
        bg: Color;
        color: Color;
        extension?: CSSObject;
      };
      fileInfo: {
        border: Border;
      };
      entries: {
        dir: { activeColor: Color; inactiveColor: Color };
        file: { activeColor: Color; inactiveColor: Color };
      };
      column: {
        bg: Color;
        color: Color;
        border: Border;
        extension?: CSSObject;
      };
      extension?: CSSObject;
    };
    modalDialog: {
      bg: Color;
      color: Color;
      border: Border;
      shadow: BoxShadow;
      backdropColor: Color;
    };
    misc: {
      hotKeyText: Color;
    };
  }
}
