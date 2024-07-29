import { useAppSelector } from "../../store/store";

export function useAppFs() {
  return useAppSelector((state) => state.fs());
}
