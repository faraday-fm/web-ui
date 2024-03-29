import { useContext, useEffect } from "react";
import { Callback, CommandBindingsContext } from "./commandBindingsContext";
import { BuiltInCommand } from "./types";

export function useCommandBinding(command: BuiltInCommand, callback: Callback, isActive = true) {
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
