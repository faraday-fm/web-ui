import { QuickNavigationProvider } from "../contexts/quickNavigationContext";
import { css } from "../features/styles";
import { TopMenuItem } from "./TopMenuItem";

export function TopMenu() {
  return (
    <QuickNavigationProvider>
      <div className={css("top-menu-root")}>
        <TopMenuItem header="Left" />
        <TopMenuItem header="Files" />
        <TopMenuItem header="Commands" />
        <TopMenuItem header="Options" />
        <TopMenuItem header="Right" />
        <TopMenuItem header="File" />
      </div>
    </QuickNavigationProvider>
  );
}
