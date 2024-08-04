import path from "node:path";
import { fileURLToPath } from "node:url";

import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import ts from "@rollup/plugin-typescript";

import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import { dts } from "rollup-plugin-dts";
// import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { visualizer } from "rollup-plugin-visualizer";
import { string } from "./scripts/string";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const projectRootDir = path.resolve(dirname);

const watch = !!process.env.ROLLUP_WATCH;

export default defineConfig({
  input: "src/index.tsx",
  output: [
    {
      file: "dist/index.cjs.js",
      sourcemap: true,
      format: "cjs",
    },
    {
      file: "dist/index.esm.js",
      sourcemap: true,
      format: "esm",
    },
  ],
  // external: ["react", "react/jsx-runtime"],
  external: ["react", "react/jsx-runtime", "fast-deep-equal", "parsimmon", "jotai", "valibot", "list", "json5", "is-promise"],
  context: "window",
  plugins: [
    !watch && [terser({ sourceMap: true }), del({ targets: ["dist/*"] })],
    json(),
    // peerDepsExternal(),
    nodeResolve({ browser: true }),
    alias({
      entries: [
        {
          find: "@assets",
          replacement: path.resolve(projectRootDir, "src/assets"),
        },
      ],
    }),
    commonjs(),
    ts({ tsconfig: "tsconfig.lib.json" }),
    string({ include: "**/*.{json5,html,css}" }),
    visualizer({ gzipSize: true }),
  ],
});
