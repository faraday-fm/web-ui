import { executeCommand } from "~/src/hooks/useCommandBinding";
import { isInContext } from "~/src/hooks/useCommandContext";
import { alt, regexp, seq, string } from "parsimmon";
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo } from "react";

type KeyCombination =
  | { error: true }
  | {
      error: false;
      ctrl: boolean;
      alt: boolean;
      shift: boolean;
      meta: boolean;
      code: string;
    };

const modifier = alt(string("ctrl"), string("alt"), string("shift"), string("meta"));
const modifierPlus = seq(modifier, string("+")).map(([mod]) => mod);
const modifiers = modifierPlus.many();
const parser = seq(modifiers, regexp(/[A-Za-z0-9]+/)).map(([mod, key]) => ({ mod, key }));

function normalizeKeyCombinationStr(keyStr: string): string {
  return keyStr.replaceAll(/\s+/gi, "").toLowerCase();
}

function parseKeyCombination(keyCombinationStr: string): KeyCombination {
  keyCombinationStr = normalizeKeyCombinationStr(keyCombinationStr);
  const res = parser.parse(keyCombinationStr);
  if (res.status) {
    return {
      error: false,
      alt: res.value.mod.includes("alt"),
      ctrl: res.value.mod.includes("ctrl"),
      meta: res.value.mod.includes("meta"),
      shift: res.value.mod.includes("shift"),
      code: res.value.key,
    };
  }
  return { error: true };
}

export type KeyBinding = {
  key: string;
  command: string;
  when?: string;
  args?: any;
};

const KeyBindingContext = createContext<KeyBinding[]>([]);

type KeyBindingProviderProps = { bindings: KeyBinding[] } & PropsWithChildren<unknown>;

export function KeyBindingProvider({ bindings, children }: KeyBindingProviderProps) {
  const parsedKeyCombinationsCache = useMemo(() => new Map<string, KeyCombination>(), []);

  const getKeyCombination = useCallback(
    (keyStr: string): KeyCombination => {
      let key = parsedKeyCombinationsCache.get(keyStr);
      if (key) {
        return key;
      }
      key = parseKeyCombination(keyStr);
      parsedKeyCombinationsCache.set(keyStr, key);
      return key;
    },
    [parsedKeyCombinationsCache]
  );

  const matchKey = useCallback(
    (key: string, event: KeyboardEvent) => {
      const combination = getKeyCombination(key);
      if (combination.error) return false;
      return (
        event.code.toLowerCase() === combination.code &&
        event.altKey === combination.alt &&
        event.ctrlKey === combination.ctrl &&
        event.metaKey === combination.meta &&
        event.shiftKey === combination.shift
      );
    },
    [getKeyCombination]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const keyCodeStr = [e.ctrlKey ? "Ctrl" : "", e.altKey ? "Alt" : "", e.shiftKey ? "Shift" : "", e.metaKey ? "Meta" : "", e.code]
        .filter((m) => m)
        .join("+");
      console.debug(`Key pressed: ${e.key} (${keyCodeStr})`);
      for (let i = bindings.length - 1; i >= 0; i -= 1) {
        const binding = bindings[i];
        if (matchKey(binding.key, e) && (!binding.when || isInContext(binding.when))) {
          console.debug(`executeCommand("${binding.command}", ${JSON.stringify(binding.args)})`);
          executeCommand(binding.command, binding.args);
          e.stopPropagation();
          e.preventDefault();
          break;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bindings, matchKey]);

  return <KeyBindingContext.Provider value={bindings}>{children}</KeyBindingContext.Provider>;
}
