import { createFilter } from "@rollup/pluginutils";
import type { Plugin } from "rollup";

export const string = (opts: { include: string; exclude?: string }): Plugin => {
  if (!opts.include) {
    throw Error("include option should be specified");
  }

  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: "string",

    transform(code, id) {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: "" },
        };
      }
    },
  };
};
