import { Disposable, FileChangeEvent, FileSystemProvider, FsEntry } from "@types";

import { FileSystemError } from "./FileSystemError";

type Dir = FsEntry & { isDir: true; isFile: false; children: DirOrFile[] };
type File = FsEntry & { isFile: true; isDir: false; content: Uint8Array };

type DirOrFile = Dir | File;

export class CombinedFsProvider implements FileSystemProvider {
  innerProviders: Record<string, FileSystemProvider | undefined>;

  constructor(innerProviders: Record<string, FileSystemProvider>) {
    this.innerProviders = innerProviders;
  }

  watch(url: URL, listener: (events: FileChangeEvent[]) => void, options: { recursive: boolean; excludes: string[] }): Disposable {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.watch(url, listener, options);
  }

  readDirectory(url: URL) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.readDirectory(url);
  }

  createDirectory(url: URL) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.createDirectory(url);
  }

  readFile(url: URL) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.readFile(url);
  }

  writeFile(url: URL, content: Uint8Array, options: { create: boolean; overwrite: boolean }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.writeFile(url, content, options);
  }

  delete(url: URL, options: { recursive: boolean }) {
    const provider = this.resolveProvider(url);
    return provider.delete(url, options);
  }

  rename(oldUrl: URL, newUrl: URL, options: { overwrite: boolean }) {
    const provider = this.resolveProvider(oldUrl);
    return provider.rename(oldUrl, newUrl, options);
  }

  copy?(source: URL, destination: URL, options: { overwrite: boolean }) {
    const provider = this.resolveProvider(source);
    if (!provider.copy) {
      throw FileSystemError.FileNotFound(source);
    }
    return provider.copy(source, destination, options);
  }

  private resolveProvider(url: URL) {
    const provider = this.innerProviders[url.protocol];
    if (!provider) {
      console.error("URL", this.innerProviders, url);
      throw FileSystemError.FileNotFound(url);
    }
    return provider;
  }
}
