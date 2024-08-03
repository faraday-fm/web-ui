import { atom, useAtom } from "jotai";

const iconThemeIdAtom = atom<string>();
const langAtom = atom<string>();

export function useSettings() {
  const [iconThemeId, setIconThemeId] = useAtom(iconThemeIdAtom);
  const [lang, setLang] = useAtom(langAtom);
  return {
    iconThemeId,
    setIconThemeId,
    lang,
    setLang,
  };
}
