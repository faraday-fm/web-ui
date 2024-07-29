import { useAppSelector } from "../store";

export function useInert() {
  return useAppSelector((state) => state.inert);
}
