import type { FileSystemProvider } from "./types";

export async function* iterateDir(fs: FileSystemProvider, path: string, signal?: AbortSignal) {
  const handle = await fs.openDir(path, { signal });
  try {
    let dirents = await fs.readDir(handle, { signal });
    yield dirents.files;
    while (!dirents.endOfList) {
      dirents = await fs.readDir(handle, { signal });
      yield dirents.files;
    }
  } finally {
    await fs.close(handle);
  }
}
