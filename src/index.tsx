import { App } from "./components/App";
import { SettingsTracker } from "./components/SettingsTracker/SettingsTracker";
import { Extensions } from "./components/extensions/Extensions";
import { FaradayHostProvider } from "./contexts/faradayHostContext";
import { FileIconsProvider } from "./contexts/fileIconsContext";
import { GlyphSizeProvider } from "./contexts/glyphSizeContext";
import { KeyBindingProvider } from "./contexts/keyBindingContext";
import { ContextVariablesProvider } from "./features/commands";
import { AppStoreProvider } from "./features/store";
import { useStyles } from "./features/styles";
import { ThemeProvider } from "./features/themes";
import { darkTheme, lightTheme } from "./features/themes/themes";
import { useMediaQuery } from "./hooks/useMediaQuery";
import type { FaradayProps } from "./types";

export { isDir } from "./features/fs/utils";
export * from "./features/fs/FileSystemError";
export * from "./features/fs/types";
export type {
  FaradayConfig,
  FaradayHost,
  FaradayProps,
  Terminal,
  TerminalSession,
} from "./types";

export function Faraday({ host }: FaradayProps) {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = dark ? darkTheme : lightTheme;
  useStyles(theme);
  return (
    <AppStoreProvider>
      <ContextVariablesProvider>
        <ThemeProvider theme={theme}>
          <FaradayHostProvider host={host}>
            <KeyBindingProvider>
              <GlyphSizeProvider>
                <FileIconsProvider>
                  <App />
                  <Extensions root=".faraday/extensions" />
                  <SettingsTracker path=".faraday/settings.json5" />
                </FileIconsProvider>
              </GlyphSizeProvider>
            </KeyBindingProvider>
          </FaradayHostProvider>
        </ThemeProvider>
      </ContextVariablesProvider>
    </AppStoreProvider>
  );
}
