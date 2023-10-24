import { FileSystemProvider } from "@features/fs/types";
import { IconTheme, IconThemeSchema } from "@schemas/iconTheme";
import { ExtensionManifest, ExtensionManifestSchema } from "@schemas/manifest";
import { combine } from "@utils/path";
import JSON5 from "json5";
import { parse } from "valibot";

export class Extension {
  id = "";

  manifest?: ExtensionManifest;

  constructor(private path: string, private fs: FileSystemProvider) {}

  public async load() {
    try {
      const packageJsonRaw = await this.fs.readFile(combine(this.path, "package.json"));
      const packageJson: unknown = JSON5.parse(new TextDecoder().decode(packageJsonRaw));
      this.manifest = parse(ExtensionManifestSchema, packageJson);
      this.id = `${this.manifest.publisher}.${this.manifest.name}`;
    } catch (err) {
      throw new Error(`Cannot load extension from path '${this.path}'.`, { cause: err });
    }
  }

  public async getIconTheme(): Promise<{ path: string; theme: IconTheme } | undefined> {
    const iconThemes = this.manifest?.contributes?.iconThemes;
    if (!iconThemes) {
      return undefined;
    }
    const firstTheme = iconThemes[0];
    const path = combine(this.path, firstTheme.path);
    const json = new TextDecoder().decode(await this.fs.readFile(path));
    const theme = parse(IconThemeSchema, JSON5.parse(json));
    return { path, theme };
  }
}
