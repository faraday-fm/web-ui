import { truncateProtocol } from "../../utils/path";

import { FileNotFound } from "./FileSystemError";
import { FileChangeEvent, FileSystemProvider } from "./types";

export class CombinedFsProvider implements FileSystemProvider {
  innerProviders: Record<string, FileSystemProvider | undefined>;

  constructor(innerProviders: Record<string, FileSystemProvider>) {
    this.innerProviders = innerProviders;
  }

  watchDir(url: string, listener: (events: FileChangeEvent[]) => void, options?: { signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileNotFound(url);
    }
    return provider.watchDir(truncateProtocol(url), listener, options);
  }

  watchFile(url: string, listener: (events: FileChangeEvent[]) => void, options?: { signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileNotFound(url);
    }
    return provider.watchFile(truncateProtocol(url), listener, options);
  }

  readDirectory(url: string, options?: { signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileNotFound(url);
    }
    return provider.readDirectory(truncateProtocol(url), options);
  }

  createDirectory(url: string, options?: { signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileNotFound(url);
    }
    return provider.createDirectory(truncateProtocol(url), options);
  }

  readFile(url: string, options?: { signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileNotFound(url);
    }
    return provider.readFile(truncateProtocol(url), options);
  }

  writeFile(url: string, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    if (!provider) {
      throw FileNotFound(url);
    }
    return provider.writeFile(truncateProtocol(url), content, options);
  }

  delete(url: string, options?: { recursive?: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(url);
    return provider.delete(truncateProtocol(url), options);
  }

  rename(oldUrl: string, newUrl: string, options?: { overwrite?: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(oldUrl);
    return provider.rename(oldUrl, newUrl, options);
  }

  copy?(source: string, destination: string, options?: { overwrite?: boolean; signal?: AbortSignal }) {
    const provider = this.resolveProvider(source);
    if (!provider.copy) {
      throw FileNotFound(source);
    }
    return provider.copy(source, destination, options);
  }

  private resolveProvider(url: string) {
    const provider = this.innerProviders[new URL(url).protocol];
    if (!provider) {
      throw FileNotFound(url);
    }
    return provider;
  }
}
