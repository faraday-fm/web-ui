import React, { useCallback, useContext, useEffect } from "react";

type Callback = (args?: unknown) => Promise<boolean> | boolean | void;

type CommandBindingContext = Record<string, Set<Callback> | undefined>;

const commandBindingsContext = React.createContext<CommandBindingContext>({});

export type BuiltInCommand =
  | "cursorLeft"
  | "cursorRight"
  | "cursorUp"
  | "cursorDown"
  | "cursorStart"
  | "cursorEnd"
  | "cursorPageUp"
  | "cursorPageDown"
  | "dirUp"
  | "focusNextPanel"
  | "focusPrevPanel"
  | "focusActivePanel"
  | "switchView"
  | "open"
  | "openShell"
  | "focusTerminal"
  | "togglePanels";

type PartialRecord<K extends keyof never, T> = {
  [P in K]?: T;
};

export function useCommandBinding(command: BuiltInCommand, callback: Callback, isActive = true) {
  const bindings = useContext(commandBindingsContext);
  useEffect(() => {
    if (!isActive) return undefined;
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

export function useCommandBindings(commandBindings: PartialRecord<BuiltInCommand, Callback>, isActive = true) {
  const bindings = useContext(commandBindingsContext);
  useEffect(() => {
    if (!isActive) return undefined;
    Object.entries(commandBindings).forEach(([command, callback]) => {
      let callbacks = bindings[command];
      if (!callbacks) {
        callbacks = new Set();
        bindings[command] = callbacks;
      }
      callbacks.add(callback);
    });
    return () => {
      Object.entries(commandBindings).forEach(([command, callback]) => {
        const callbacks = bindings[command];
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            delete bindings[command];
          }
        }
      });
    };
  }, [bindings, commandBindings, isActive]);
}

export function useExecuteCommand() {
  const bindings = useContext(commandBindingsContext);
  const executor = useCallback(
    (command: string, args?: unknown) => {
      const callbacks = bindings[command];
      if (!callbacks || callbacks.size !== 1) {
        return false;
      }
      const [cb] = callbacks;
      const result = cb(args);
      if (typeof result === "undefined") {
        return true;
      }
      return result;
    },
    [bindings]
  );

  return executor;
}

export function useExecuteBuiltInCommand() {
  const executor = useExecuteCommand();
  return (command: BuiltInCommand, args?: unknown) => {
    return executor(command, args);
  };
}
