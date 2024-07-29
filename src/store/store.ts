import { InferStateType, useSelector } from "effie";
import { RootStore } from "./RootStore";

export type RootState = InferStateType<ReturnType<typeof RootStore>>;
export const useAppSelector = useSelector.withTypes<RootState>();
