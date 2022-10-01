import { QuickNavigationProvider } from "contexts/quickNavigationContext";

import classes from "./TopMenu.module.css";
import { TopMenuItem } from "./TopMenuItem";

export function TopMenu() {
  return (
    <QuickNavigationProvider>
      <div className={classes.root}>
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
