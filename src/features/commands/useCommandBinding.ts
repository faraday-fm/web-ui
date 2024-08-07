import { useContext, useEffect } from "react";
import { type Callback, CommandBindingsContext } from "./commandBindingsContext";

export function useCommandBinding(command: string, callback: Callback, isActive = true) {
  const bindings = useContext(CommandBindingsContext);
  useEffect(() => {
    if (!isActive) return;
    let callbacks = bindings[command];
    if (!callbacks) {
      callbacks = new Set();
      bindings[command] = callbacks;
    }
    callbacks.add(callback);
    return () => {
      callbacks?.delete(callback);
      if (callbacks?.size === 0) {
        delete bindings[command];
      }
    };
  }, [command, callback, isActive, bindings]);
}
