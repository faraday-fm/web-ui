import { QuickNavigationProvider } from "@contexts/quickNavigationContext";

import { TopMenuItem } from "./TopMenuItem";
import { css } from "@features/styles";

export function TopMenu() {
  return (
    <QuickNavigationProvider>
      <div className={css("TopMenuRoot")}>
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
