import alias from "@rollup/plugin-alias";
import path from "path";
import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import { fileURLToPath } from "url";
import json from "@rollup/plugin-json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRootDir = path.resolve(__dirname);

export default defineConfig({
  input: "src/main.tsx",
  output: {
    file: "dist/main.js",
    format: "esm",
  },
  plugins: [
    json(),
    alias({
      entries: [{ find: "@assets", replacement: path.resolve(projectRootDir, "src/assets") }],
    }),
    typescript({ useTsconfigDeclarationDir: true }),
  ],
});
