import keyBindings from "~/src/assets/keybindings.json";
import App from "~/src/components/App/App";
import { GlyphSizeProvider } from "~/src/contexts/glyphSizeContext";
import { KeyBindingProvider } from "~/src/contexts/keyBindingContext";
import { DemoRpcChannel } from "~/src/features/rpc/demoRpcChannel";
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "styled-components";
import { theme } from "./themes/far-theme";
import { FarMoreHost } from "./types";
import { FarMoreHostProvider } from "./contexts/farMoreHostContext";

const rpcChannel = new DemoRpcChannel();

export type FarMoreProps = {
  host: FarMoreHost;
};

export function FarMore({ host }: FarMoreProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <KeyBindingProvider bindings={keyBindings}>
          <GlyphSizeProvider>
            <FarMoreHostProvider host={host}>
              <App />
            </FarMoreHostProvider>
          </GlyphSizeProvider>
        </KeyBindingProvider>
      </ThemeProvider>
    </Provider>
  );
}
