import { AutoHotKeyLabel } from "components/AutoHotKeyLabel/AutoHotKeyLabel";

import classes from "./TopMenuItem.module.css";

type TopMenuItemProps = {
  header: string;
};

export function TopMenuItem({ header }: TopMenuItemProps) {
  return (
    <div className={classes.topMenuItem} style={{ position: "relative" }}>
      <AutoHotKeyLabel text={header} />
      {/* <HotKey>{(k) => <Highlight text={header} highlight={k} />}</HotKey> */}
      <div style={{ position: "absolute", top: "100%", backgroundColor: "red" }}>
        <AutoHotKeyLabel text="12345" />
      </div>
    </div>
  );
}
