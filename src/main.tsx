import keyBindings from "@assets/keybindings.json";
import App from "@components/App/App";
import { GlyphSizeProvider } from "@contexts/glyphSizeContext";
import { KeyBindingProvider } from "@contexts/keyBindingContext";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "styled-components";
import { FarMoreHostProvider } from "@contexts/farMoreHostContext";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { store } from "@store";
import { darkTheme, lightTheme } from "@themes/theme";
import { FarMoreHost } from "@types";

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
