export interface Border {
  color: string;
  radius: React.CSSProperties["borderRadius"];
  thickness: string;
  margin: string;
  padding: string;
  extension?: React.CSSProperties;
}

type Color = React.CSSProperties["color"];

export interface Palette {
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
}

export interface Theme {
  fontFamily: string;
  colors: {
    /* Base colors */
    focusBorder: string;
    foreground: string;
    disabledForeground: string;
    errorForeground: string;
    descriptionForeground: string;

    /* Text colors */
    "textBlockQuote.background": string; // Background color for block quotes in text.
    "textBlockQuote.border": string; // Border color for block quotes in text.
    "textCodeBlock.background": string; // Background color for code blocks in text.
    "textLink.activeForeground": string; // Foreground color for links in text when clicked on and on mouse hover.
    "textLink.foreground": string; // Foreground color for links in text.
    "textPreformat.foreground": string; // Foreground color for preformatted text segments.
    "textSeparator.foreground": string; // Color for text separators.
    "textAcceleratorKey.foreground": string;

    /* Action bar */
    "actionBar.buttonForeground": string;
    "actionBar.buttonBackground": string;
    "actionBar.keyForeground": string;
    "actionBar.keyBackground": string;

    /* Button control */
    "button.background": string; // Button background color.
    "button.background:hover": string; // Button background color when hovering.
    "button.foreground": string; // Button foreground color.
    "button.border": string; // Button border color.
    "button.separator": string; // Button separator color.
    "button.secondary.foreground": string; // Secondary button foreground color.
    "button.secondary.background": string; // Secondary button background color.
    "button.secondary.background:hover": string; // Secondary button background color when hovering.
    "checkbox.background": string; // Background color of checkbox widget.
    "checkbox.foreground": string; // Foreground color of checkbox widget.
    "checkbox.border": string; // Border color of checkbox widget.
    "checkbox.background:select": string; // Background color of checkbox widget when the element it's in is selected.
    "checkbox.border:select": string; // Border color of checkbox widget when the element it's in is selected.

    /* Modal Dialog */
    "dialog.background": string;
    "dialog.foreground": string;
    "dialog.backdrop": string;
    "dialog.border": string;
    "dialog.shadow": string;

    /* Panel */
    "panel.header.foreground": string;
    "panel.header.foreground:focus": string;
    "panel.header.background": string;
    "panel.header.background:focus": string;
    "panel.foreground": string;
    "panel.background": string;
    "panel.background:focus": string;
    "panel.border": string;
    "panel.border:focus": string;

    /* Files */
    "files.directory.background": string;
    "files.directory.foreground": string;
    "files.directory.background:focus": string;
    "files.directory.foreground:focus": string;
    "files.directory.border:focus": string;
    "files.file.background": string;
    "files.file.foreground": string;
    "files.file.background:focus": string;
    "files.file.foreground:focus": string;
    "files.file.border:focus": string;
  };
  // palette: Palette;
  // fontFamily: string;
  // primaryBg: Color;
  // primaryText: Color;
  // actionsBar: {
  //   bg: Color;
  //   color: Color;
  //   fnKey: {
  //     color: Color;
  //     extension?: CSSObject;
  //   };
  // };
  // filePanel: {
  //   bg: Color;
  //   activeBg: Color;
  //   color: Color;
  //   border: Border;
  //   header: {
  //     activeBg: Color;
  //     inactiveBg: Color;
  //     activeColor: Color;
  //     inactiveColor: Color;
  //     extension?: CSSObject;
  //   };
  //   content: {
  //     margin: string;
  //     extension?: CSSObject;
  //   };
  //   footer: {
  //     bg: Color;
  //     color: Color;
  //     extension?: CSSObject;
  //   };
  //   fileInfo: {
  //     border: Border;
  //   };
  //   entries: {
  //     dir: { activeColor: Color; inactiveColor: Color };
  //     file: { activeColor: Color; inactiveColor: Color };
  //   };
  //   column: {
  //     bg: Color;
  //     color: Color;
  //     border: Border;
  //     extension?: CSSObject;
  //   };
  //   extension?: CSSObject;
  // };
  // modalDialog: {
  //   bg: Color;
  //   color: Color;
  //   border: Border;
  //   shadow: BoxShadow;
  //   backdropColor: Color;
  // };
  // misc: {
  //   hotKeyText: Color;
  // };
}
