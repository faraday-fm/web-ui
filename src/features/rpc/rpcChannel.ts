export interface IRpcChannel {
  call(funcName: string, params: unknown): Promise<unknown>;
  subscribe(onFuncCall: (funcName: string, params: unknown) => Promise<unknown>): () => void;
}
