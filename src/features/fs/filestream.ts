import { AceMask, Flags, type FileSystemProvider } from "./types";

const BATCH_SIZE = 1024 * 1024;

export function filestream(fs: FileSystemProvider, path: string, signal?: AbortSignal) {
  let handle: string | undefined;
  let offs = 0;
  const stream = new ReadableStream({
    async start() {
      handle = await fs.open(path, AceMask.READ_DATA, Flags.OPEN_EXISTING, undefined, { signal });
    },
    async pull(controller) {
      if (signal?.aborted) {
        controller.close();
        return;
      }
      try {
        const result = await fs.read(handle!, offs, BATCH_SIZE, { signal });
        offs += BATCH_SIZE;
        if (result.byteLength > 0) {
          controller.enqueue(result);
        } else {
          controller.close();
        }
      } catch {
        controller.close();
      }
    },
    async cancel() {
      fs.close(handle!);
    },
  });
  return stream;
}
