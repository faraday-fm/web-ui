import { FileSystemError } from "./FileSystemError";
import { FileChangeEvent, FileSystemProvider, FsEntry } from "./types";

type Dir = FsEntry & { isDir: true; isFile: false; children: DirOrFile[] };
type File = FsEntry & { isFile: true; isDir: false; content: Uint8Array };

type DirOrFile = Dir | File;

export class CombinedFsProvider implements FileSystemProvider {
  innerProviders: Record<string, FileSystemProvider | undefined>;

  constructor(innerProviders: Record<string, FileSystemProvider>) {
    this.innerProviders = innerProviders;
  }

  watch(url: string, listener: (events: FileChangeEvent[]) => void, options: { recursive: boolean; excludes: string[]; signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.watch(url, listener, options);
  }

  readDirectory(url: string, signal?: AbortSignal) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.readDirectory(url, signal);
  }

  createDirectory(url: string, signal?: AbortSignal) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.createDirectory(url, signal);
  }

  readFile(url: string, signal?: AbortSignal) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.readFile(url, signal);
  }

  writeFile(url: string, content: Uint8Array, options: { create: boolean; overwrite: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.writeFile(url, content, options);
  }

  delete(url: string, options: { recursive: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    return provider.delete(url, options);
  }

  rename(oldUrl: string, newUrl: string, options: { overwrite: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(oldUrl);
    return provider.rename(oldUrl, newUrl, options);
  }

  copy?(source: string, destination: string, options: { overwrite: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(source);
    if (!provider.copy) {
      throw FileSystemError.FileNotFound(source);
    }
    return provider.copy(source, destination, options);
  }

  private resolveProvider(url: string) {
    const provider = this.innerProviders[new URL(url).protocol];
    if (!provider) {
      throw FileSystemError.FileNotFound(url);
    }
    return provider;
  }
}
