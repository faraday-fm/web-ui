import { type PropsWithChildren, createContext, useContext } from "react";
import type { Theme } from "./types";

const ThemeContext = createContext<Theme | undefined>(undefined);

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("ThemeProvider is not initialized.");
  }
  return theme;
}

export function ThemeProvider({ theme, children }: PropsWithChildren<{ theme: Theme }>) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
