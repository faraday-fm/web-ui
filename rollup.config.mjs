import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
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
          sourcemap: true,
          format: "cjs",
        },
        {
          file: packageJson.module,
          sourcemap: true,
          format: "esm",
        },
      ],
      context: "window",
      plugins: [
        peerDepsExternal(),
        nodeResolve(),
        commonjs(),
        json(),
        alias({
          entries: [{ find: "@assets", replacement: path.resolve(projectRootDir, "src/assets") }],
        }),
        typescript({ tsconfig: "./tsconfig.json" }),
      ],
    },
    {
      input: "dist/types/main.d.ts",
      output: [{ file: packageJson.types, format: "esm" }],
      plugins: [dts({ tsconfig: "./tsconfig.json" }), !watch && del({ hook: "buildEnd", targets: "./dist/types" })],
    },
  ];
});
