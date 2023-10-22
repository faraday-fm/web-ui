import "list/methods";

import App from "@components/App";
import { ExtensionsRoot } from "@components/ExtensionsRoot";
import { FaradayHostProvider } from "@contexts/faradayHostContext";
import { FileIconsProvider } from "@contexts/fileIconsContext";
import { GlyphSizeProvider } from "@contexts/glyphSizeContext";
import { KeyBindingProvider } from "@contexts/keyBindingContext";
import { useMediaQuery } from "@hooks/useMediaQuery";
// import { theme as farTheme } from "@themes/theme";
import { darkTheme } from "@themes/theme";
import { FaradayProps } from "@types";
import { ThemeProvider } from "styled-components";
import { AppStoreProvider } from "@features/store";

export { InMemoryFsProvider } from "@features/fs/inMemoryFs";
export type { FileChangeEvent, FileChangeType, FileSystemProvider, FileSystemWatcher, FsEntry } from "@features/fs/types";
export type { FaradayConfig, FaradayHost, FaradayProps, Terminal, TerminalSession } from "@types";

export function Faraday({ host }: FaradayProps) {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <AppStoreProvider>
      <FaradayHostProvider host={host}>
        <ExtensionsRoot root="faraday:/extensions" />
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
    </AppStoreProvider>
  );
}
