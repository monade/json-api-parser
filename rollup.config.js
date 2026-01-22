import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const extensions = [".js", ".ts"];

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
      },
      {
        file: pkg.module,
        format: "es",
      },
    ],
    plugins: [
      resolve({
        extensions,
      }),
      babel({
        exclude: "node_modules/**",
        extensions,
        babelHelpers: "bundled",
      }),
    ],
  },
];
