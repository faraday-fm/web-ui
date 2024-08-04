import React from "react";

// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Callback = (args?: any) => Promise<boolean> | boolean | void;

export type CommandBindingsContext = Record<string, Set<Callback> | undefined>;

export const CommandBindingsContext = React.createContext<CommandBindingsContext>({});
