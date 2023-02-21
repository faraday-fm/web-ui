import alias from "@rollup/plugin-alias";
import path from "path";
import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { fileURLToPath } from "url";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
import packageJson from "./package.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname);

export default defineConfig(() => {
  // dev build if watching, prod build if not
  const watch = !process.env.ROLLUP_WATCH;

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
      plugins: [
        peerDepsExternal(),
        nodeResolve(),
        commonjs(),
        json(),
        alias({
          entries: [{ find: "@assets", replacement: path.resolve(projectRootDir, "src/assets") }],
        }),
        typescript({ tsconfig: "./tsconfig.json" }),
        terser(),
      ],
    },
    {
      input: "dist/types/main.d.ts",
      output: [{ file: packageJson.types, format: "esm" }],
      plugins: [dts({ tsconfig: "./tsconfig.json" }), !watch && del({ hook: "buildEnd", targets: "./dist/types" })],
    },
  ];
});
