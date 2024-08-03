import { atom, useAtom } from "jotai";

const inertAtom = atom(false);

export function useInert() {
  const [inert, setInert] = useAtom(inertAtom);
  return { inert, setInert };
}
