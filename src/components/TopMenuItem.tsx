import { css } from "../features/styles";
import { AutoHotKeyLabel } from "./AutoHotKeyLabel";

interface TopMenuItemProps {
  header: string;
}

export function TopMenuItem({ header }: TopMenuItemProps) {
  return (
    <div className={css("top-menu-item")}>
      <AutoHotKeyLabel text={header} />
      {/* <HotKey>{(k) => <Highlight text={header} highlight={k} />}</HotKey> */}
      <div className={css("top-menu-label")}>
        <AutoHotKeyLabel text="12345" />
      </div>
    </div>
  );
}
