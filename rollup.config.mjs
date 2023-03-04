import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import path from "path";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import ts from "rollup-plugin-ts";
import { fileURLToPath } from "url";

import packageJson from "./package.json" assert { type: "json" };

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const projectRootDir = path.resolve(dirname);

export default defineConfig(() => {
  // dev build if watching, prod build if not
  const watch = !!process.env.ROLLUP_WATCH;

  return [
    {
      input: packageJson.source,
      output: [
        {
          file: packageJson.main,
          sourcemap: watch ? "inline" : true,
          format: "cjs",
        },
        {
          file: packageJson.module,
          sourcemap: watch ? "inline" : true,
          format: "esm",
        },
      ],
      context: "window",
      plugins: [
        !watch && [terser({ sourceMap: true }), del({ targets: "dist/*" })],
        json(),
        peerDepsExternal(),
        nodeResolve(),
        alias({
          entries: [{ find: "@assets", replacement: path.resolve(projectRootDir, "src/assets") }],
        }),
        commonjs({ sourceMap: true }),
        ts(),
      ],
    },
  ];
});
