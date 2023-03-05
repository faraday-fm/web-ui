import { FileSystemError } from "./FileSystemError";
import { FileChangeEvent, FileSystemProvider } from "./types";

function trimProtocol(url: string) {
  return url.replace(/^(\w|-)+:\/+/, "");
}

export class CombinedFsProvider implements FileSystemProvider {
  innerProviders: Record<string, FileSystemProvider | undefined>;

  constructor(innerProviders: Record<string, FileSystemProvider>) {
    this.innerProviders = innerProviders;
  }

  watch(url: string, listener: (events: FileChangeEvent[]) => void, options?: { recursive?: boolean; excludes?: string[]; signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.watch(trimProtocol(url), listener, options);
  }

  readDirectory(url: string, options?: { signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.readDirectory(trimProtocol(url), options);
  }

  createDirectory(url: string, options?: { signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.createDirectory(trimProtocol(url), options);
  }

  readFile(url: string, options?: { signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.readFile(trimProtocol(url), options);
  }

  writeFile(url: string, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileSystemError.FileNotFound();
    }
    return provider.writeFile(trimProtocol(url), content, options);
  }

  delete(url: string, options?: { recursive?: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    return provider.delete(trimProtocol(url), options);
  }

  rename(oldUrl: string, newUrl: string, options?: { overwrite?: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(oldUrl);
    return provider.rename(oldUrl, newUrl, options);
  }

  copy?(source: string, destination: string, options?: { overwrite?: boolean; signal?: AbortSignal }) {
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
