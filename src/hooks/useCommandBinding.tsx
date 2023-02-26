import React, { useCallback, useContext, useEffect } from "react";

type Callback = (args?: unknown) => Promise<boolean> | boolean | void;

type CommandBindingContext = Map<string, Set<Callback>>;

const bindingsContext = React.createContext<CommandBindingContext>(new Map());

export type BuiltInCommand =
  | "cursorLeft"
  | "cursorRight"
  | "cursorUp"
  | "cursorDown"
  | "cursorStart"
  | "cursorEnd"
  | "cursorPageUp"
  | "cursorPageDown"
  | "focusNextPanel"
  | "focusPrevPanel"
  | "focusActivePanel"
  | "open"
  | "openShell"
  | "focusTerminal"
  | "togglePanels";

type PartialRecord<K extends keyof never, T> = {
  [P in K]?: T;
};

export function useCommandBinding(command: BuiltInCommand, callback: Callback, isActive = true) {
  const bindings = useContext(bindingsContext);
  useEffect(() => {
    if (!isActive) return undefined;
    let callbacks = bindings.get(command);
    if (!callbacks) {
      callbacks = new Set();
      bindings.set(command, callbacks);
    }
    callbacks.add(callback);
    return () => {
      callbacks?.delete(callback);
      if (callbacks?.size === 0) {
        bindings.delete(command);
      }
    };
  }, [command, callback, isActive, bindings]);
}

export function useCommandBindings(commandBindings: PartialRecord<BuiltInCommand, Callback>, isActive = true) {
  const bindings = useContext(bindingsContext);
  useEffect(() => {
    if (!isActive) return undefined;
    Object.entries(commandBindings).forEach(([command, callback]) => {
      let callbacks = bindings.get(command);
      if (!callbacks) {
        callbacks = new Set();
        bindings.set(command, callbacks);
      }
      callbacks.add(callback);
    });
    return () => {
      Object.entries(commandBindings).forEach(([command, callback]) => {
        const callbacks = bindings.get(command);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            bindings.delete(command);
          }
        }
      });
    };
  }, [bindings, commandBindings, isActive]);
}

export function useExecuteCommand() {
  const bindings = useContext(bindingsContext);
  const executor = useCallback(
    (command: string, args?: unknown) => {
      const callbacks = bindings.get(command);
      if (!callbacks || callbacks.size !== 1) {
        return false;
      }
      // eslint-disable-next-line no-unreachable-loop
      for (const cb of callbacks.values()) {
        const result = cb(args);
        if (typeof result === "undefined") {
          return true;
        }
        return result;
      }
      return false;
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
