import { AutoHotKeyLabel } from "@components/AutoHotKeyLabel";
import { css } from "@features/styles";

interface TopMenuItemProps {
  header: string;
}

export function TopMenuItem({ header }: TopMenuItemProps) {
  return (
    <div className={css("TopMenuItem")}>
      <AutoHotKeyLabel text={header} />
      {/* <HotKey>{(k) => <Highlight text={header} highlight={k} />}</HotKey> */}
      <div className={css("TopMenuLabel")}>
        <AutoHotKeyLabel text="12345" />
      </div>
    </div>
  );
}
