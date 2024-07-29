import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import ts from "rollup-plugin-typescript2";
import path from "path";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { string } from "rollup-plugin-string";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath } from "url";
import { dts } from "rollup-plugin-dts";

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
          sourcemap: true,
          format: "cjs",
        },
        {
          file: packageJson.module,
          sourcemap: true,
          format: "esm",
        },
      ],
      external: ["fast-deep-equal", "parsimmon", "valibot", "list", "immer", "use-resize-observer", "json5", "effie", "is-promise"],
      context: "window",
      plugins: [
        !watch && [terser({ sourceMap: true }), del({ targets: ["dist/*", "dist-dts/*"] })],
        json(),
        peerDepsExternal(),
        // nodeResolve({ browser: true }),
        alias({
          entries: [{ find: "@assets", replacement: path.resolve(projectRootDir, "src/assets") }],
        }),
        commonjs(),
        ts({ useTsconfigDeclarationDir: true }),
        string({ include: "**/*.{json5,html,css}" }),
        visualizer({ gzipSize: true }),
      ],
    },
    {
      input: "./dist-dts/index.d.ts",
      output: [{ file: "dist/index.d.ts", format: "es" }],
      plugins: [dts()],
    },
  ];
});
