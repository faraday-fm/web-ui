import keyBindings from "~/src/assets/keybindings.json";
import App from "~/src/components/App/App";
import { GlyphSizeProvider } from "~/src/contexts/glyphSizeContext";
import { KeyBindingProvider } from "~/src/contexts/keyBindingContext";
import { RpcChannelProvider } from "~/src/contexts/rpcChannelContext";
import { DemoRpcChannel } from "~/src/features/rpc/demoRpcChannel";
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "styled-components";
import { theme } from "./themes/far-theme";

const rpcChannel = new DemoRpcChannel();

export function FarMore() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <KeyBindingProvider bindings={keyBindings}>
          <GlyphSizeProvider>
            <RpcChannelProvider channel={rpcChannel}>
              <App />
            </RpcChannelProvider>
          </GlyphSizeProvider>
        </KeyBindingProvider>
      </ThemeProvider>
    </Provider>
  );
}
