/* eslint-disable @typescript-eslint/no-unused-vars */
import { IRpcChannel } from "./rpcChannel";

export class DummyRpcChannel implements IRpcChannel {
  call(funcName: string, params: unknown): Promise<unknown> {
    return Promise.resolve();
  }

  subscribe(onFuncCall: (funcName: string, params: unknown) => Promise<unknown>): () => void {
    return () => {
      /* skip */
    };
  }
}
