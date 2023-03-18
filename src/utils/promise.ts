/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function deferredPromise<T = unknown>() {
  let resolve: (val: T) => void = undefined!;
  let reject: (reason?: any) => void = undefined!;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
