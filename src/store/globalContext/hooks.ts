import { useAppSelector } from "../store";

export function useGlobalContext() {
  return useAppSelector((state) => state.globalContext);
}
