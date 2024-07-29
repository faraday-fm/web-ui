import { ReactNode, useState } from "react";
import { createStore } from "react-rehoox";
import { App } from "./components/App";
import { FaradayHostProvider } from "./contexts/faradayHostContext";
import { GlyphSizeProvider } from "./contexts/glyphSizeContext";
import { KeyBindingProvider } from "./contexts/keyBindingContext";
import { ContextVariablesProvider } from "./features/commands";
import { useStyles } from "./features/styles";
import { ThemeProvider } from "./features/themes";
import { darkTheme, lightTheme } from "./features/themes/themes";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { RootStore } from "./store/RootStore";
import { FaradayProps } from "./types";
import { FileSystemProvider } from "./features/fs/FileSystemContext";

export { InMemoryFsProvider } from "./features/fs/inMemoryFs";
export type { FileChangeEvent, FileChangeType, FileSystemProvider, FileSystemWatcher, FsEntry } from "./features/fs/types";
export type { FaradayConfig, FaradayHost, FaradayProps, Terminal, TerminalSession } from "./types";

export function Faraday({ host }: FaradayProps) {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = dark ? darkTheme : lightTheme;
  const [store] = useState(() => {
    const providers = (child: ReactNode) => (
      <FaradayHostProvider host={host}>
        <FileSystemProvider>{child}</FileSystemProvider>
      </FaradayHostProvider>
    );
    return createStore(RootStore, providers);
  });

  useStyles(theme);
  return (
    <store.Provider>
      {/* <FaradayHostProvider host={host}> */}
      <ContextVariablesProvider>
        <ThemeProvider theme={theme}>
          <KeyBindingProvider>
            <GlyphSizeProvider>
              {/* <FileIconsProvider> */}
              <App host={host} />
              {/* </FileIconsProvider> */}
            </GlyphSizeProvider>
          </KeyBindingProvider>
        </ThemeProvider>
      </ContextVariablesProvider>
      {/* </FaradayHostProvider> */}
    </store.Provider>
  );
}
