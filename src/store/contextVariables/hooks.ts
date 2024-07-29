import { useAppSelector } from "../store";

export function useContextVariables() {
  return useAppSelector((state) => state.contextVariables);
}
