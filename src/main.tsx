import "list/methods";

import App from "@components/App";
import { FaradayHostProvider } from "@contexts/faradayHostContext";
import { FileIconsProvider } from "@contexts/fileIconsContext";
import { GlobalContextProvider } from "@contexts/globalContext";
import { GlyphSizeProvider } from "@contexts/glyphSizeContext";
import { KeyBindingProvider } from "@contexts/keyBindingContext";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { store } from "@store";
// import { theme as farTheme } from "@themes/theme";
import { darkTheme } from "@themes/theme";
import { FaradayProps } from "@types";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "styled-components";

export { InMemoryFsProvider } from "@features/fs/inMemoryFs";
export type { FileChangeEvent, FileChangeType, FileSystemProvider, FileSystemWatcher, FsEntry } from "@features/fs/types";
export type { FaradayConfig, FaradayHost, FaradayProps, Terminal, TerminalSession } from "@types";

export function Faraday({ host }: FaradayProps) {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <ReduxProvider store={store}>
      <GlobalContextProvider>
        <FaradayHostProvider host={host}>
          <ThemeProvider theme={dark ? darkTheme : darkTheme}>
            <KeyBindingProvider>
              <GlyphSizeProvider>
                <FileIconsProvider>
                  <App />
                </FileIconsProvider>
              </GlyphSizeProvider>
            </KeyBindingProvider>
          </ThemeProvider>
        </FaradayHostProvider>
      </GlobalContextProvider>
    </ReduxProvider>
  );
}
