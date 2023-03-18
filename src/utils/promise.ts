export function deferredPromise<T = unknown>() {
  let resolve!: (val: T) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export type DeferredPromise<T> = ReturnType<typeof deferredPromise<T>>;
