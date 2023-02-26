import keyBindings from "@assets/keybindings.json" assert { type: "json" };
import App from "@components/App/App";
import { FarMoreHostProvider } from "@contexts/farMoreHostContext";
import { GlyphSizeProvider } from "@contexts/glyphSizeContext";
import { KeyBindingProvider } from "@contexts/keyBindingContext";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { store } from "@store";
import { theme as farTheme } from "@themes/far-theme";
import { darkTheme, lightTheme } from "@themes/theme";
import { FarMoreHost } from "@types";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "styled-components";

export { createInMemoryFs } from "@features/fs/inMemoryFs";
export type { Disposable, FarMoreConfig, FarMoreHost, FileChangeEvent, FileChangeType, FileSystemProvider, FsEntry, Terminal, TerminalSession } from "@types";

export type FarMoreProps = {
  host: FarMoreHost;
};

export function FarMore({ host }: FarMoreProps) {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={dark ? darkTheme : farTheme}>
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
