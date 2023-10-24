import React from "react";

export type Callback = (args?: unknown) => Promise<boolean> | boolean | void;

export type CommandBindingsContext = Record<string, Set<Callback> | undefined>;

export const CommandBindingsContext = React.createContext<CommandBindingsContext>({});
