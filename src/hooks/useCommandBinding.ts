import { useEffect } from "react";

type Callback = (args?: any) => Promise<boolean> | boolean | void;

const bindings = new Map<string, Set<Callback>>();

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
  }, [command, callback, isActive]);
}

export function useCommandBindings(commandBindings: PartialRecord<BuiltInCommand, Callback>, isActive = true) {
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
  }, [commandBindings, isActive]);
}

export async function executeCommand(command: string, args?: any): Promise<boolean> {
  const callbacks = bindings.get(command);
  if (!callbacks || callbacks.size !== 1) {
    return false;
  }
  // eslint-disable-next-line no-unreachable-loop, no-restricted-syntax
  for (const cb of callbacks) {
    const result = cb(args);
    if (typeof result === "undefined") {
      return true;
    }
    return result;
  }
  return false;
}

export async function executeBuiltInCommand(command: BuiltInCommand, args?: any): Promise<boolean> {
  return executeCommand(command, args);
}
