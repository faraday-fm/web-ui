import { FileSystemProvider } from "@features/fs/types";
import { append, getAllExtensions } from "@utils/path";
import JSON5 from "json5";

import { IconTheme, IconThemeSchema } from "./schemas/iconTheme";
import { Manifest, ManifestSchema } from "./schemas/manifest";

export class Extension {
  manifest?: Manifest;

  quickViewScriptsCache = new Map<string, string>();

  constructor(private path: string, private fs: FileSystemProvider) {}

  public async load() {
    try {
      const packageJsonRaw = await this.fs.readFile(append(this.path, "package.json"));
      const packageJson = JSON5.parse(new TextDecoder().decode(packageJsonRaw));
      this.manifest = ManifestSchema.parse(packageJson);
    } catch (err) {
      throw new Error(`Cannot load extension from path '${this.path}'.`, { cause: err });
    }
  }

  public async getQuickViewScript({ filename, mimetype }: { filename: string; mimetype?: string }): Promise<string | undefined> {
    const quickViews = this.manifest?.contributes?.quickViews;
    if (!quickViews) {
      return undefined;
    }
    const quickView = quickViews.find((qw) => {
      if (mimetype && qw.mimetypes?.includes(mimetype)) {
        return true;
      }

      if (qw.filenames?.includes(filename)) {
        return true;
      }

      if (qw.extensions) {
        for (const ext of getAllExtensions(filename, true)) {
          if (qw.extensions.includes(ext)) {
            return true;
          }
        }
      }
      return false;
    });

    if (!quickView?.path) {
      return undefined;
    }

    const cachedScript = this.quickViewScriptsCache.get(quickView.path);
    if (cachedScript) {
      return cachedScript;
    }

    const script = new TextDecoder().decode(await this.fs.readFile(append(this.path, quickView.path)));
    this.quickViewScriptsCache.set(quickView.path, script);

    return script;
  }

  public async getIconTheme(): Promise<{ path: string; theme: IconTheme } | undefined> {
    const iconThemes = this.manifest?.contributes?.iconThemes;
    if (!iconThemes) {
      return undefined;
    }
    const firstTheme = iconThemes[0];
    const path = append(this.path, firstTheme.path);
    const json = new TextDecoder().decode(await this.fs.readFile(path));
    const theme = IconThemeSchema.parse(JSON5.parse(json));
    return { path, theme };
  }
}
