import { Provider } from "jotai";

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
