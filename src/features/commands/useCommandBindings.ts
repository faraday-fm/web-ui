import { useContext, useEffect } from "react";
import { type Callback, CommandBindingsContext } from "./commandBindingsContext";

type PartialRecord<K extends keyof never, T> = {
  [P in K]?: T;
};

export function useCommandBindings(commandBindings: PartialRecord<string, Callback>, isActive = true) {
  const bindings = useContext(CommandBindingsContext);
  useEffect(() => {
    if (!isActive) return;
    Object.entries(commandBindings).forEach(([command, callback]) => {
      let callbacks = bindings[command];
      if (!callbacks) {
        callbacks = new Set();
        bindings[command] = callbacks;
      }
      callbacks.add(callback!);
    });
    return () => {
      Object.entries(commandBindings).forEach(([command, callback]) => {
        const callbacks = bindings[command];
        if (callbacks) {
          callbacks.delete(callback!);
          if (callbacks.size === 0) {
            delete bindings[command];
          }
        }
      });
    };
  }, [bindings, commandBindings, isActive]);
}
