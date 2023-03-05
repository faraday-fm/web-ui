import "list/methods";

import App from "@components/App/App";
import { FarMoreHostProvider } from "@contexts/farMoreHostContext";
import { GlyphSizeProvider } from "@contexts/glyphSizeContext";
import { KeyBindingProvider } from "@contexts/keyBindingContext";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { store } from "@store";
import { theme as farTheme } from "@themes/far-theme";
import { darkTheme } from "@themes/theme";
import { FarMoreProps } from "@types";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "styled-components";

export { InMemoryFsProvider } from "@features/fs/inMemoryFs";
export type { FileChangeEvent, FileChangeType, FileSystemProvider, FileSystemWatcher, FsEntry } from "@features/fs/types";
export type { FarMoreConfig, FarMoreHost, FarMoreProps, Terminal, TerminalSession } from "@types";

export function FarMore({ host }: FarMoreProps) {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <ReduxProvider store={store}>
      <FarMoreHostProvider host={host}>
        <ThemeProvider theme={dark ? darkTheme : farTheme}>
          <KeyBindingProvider>
            <GlyphSizeProvider>
              <App />
            </GlyphSizeProvider>
          </KeyBindingProvider>
        </ThemeProvider>
      </FarMoreHostProvider>
    </ReduxProvider>
  );
}
