import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "styled-components";
import keyBindings from "~/src/assets/keybindings.json";
import App from "~/src/components/App/App";
import { GlyphSizeProvider } from "~/src/contexts/glyphSizeContext";
import { KeyBindingProvider } from "~/src/contexts/keyBindingContext";
import { store } from "./store";
import { FarMoreHost } from "./types";
import { FarMoreHostProvider } from "./contexts/farMoreHostContext";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { darkTheme, lightTheme } from "./themes/theme";

export type FarMoreProps = {
  host: FarMoreHost;
};

export function FarMore({ host }: FarMoreProps) {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={dark ? darkTheme : lightTheme}>
        <KeyBindingProvider bindings={keyBindings}>
          <GlyphSizeProvider>
            <FarMoreHostProvider host={host}>
              <App />
            </FarMoreHostProvider>
          </GlyphSizeProvider>
        </KeyBindingProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
