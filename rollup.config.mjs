import path from "node:path";
import { fileURLToPath } from "node:url";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import { dts } from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { string } from "rollup-plugin-string";
import ts from "rollup-plugin-typescript2";
import { visualizer } from "rollup-plugin-visualizer";

import packageJson from "./package.json" with { type: "json" };

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
      // external: ["react", "react/jsx-runtime"],
      external: ["react", "react/jsx-runtime", "fast-deep-equal", "parsimmon", "valibot", "list", "json5", "is-promise"],
      context: "window",
      plugins: [
        !watch && [terser({ sourceMap: true }), del({ targets: ["dist/*", "dist-dts/*"] })],
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
