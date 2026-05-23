import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 外部ライブラリやビルド成果物を解析対象から除外する。
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
<<<<<<< HEAD
    "public/scripts/**", // A-Frame, MindAR 等の外部スクリプトを除外。
=======
    "public/scripts/**",
>>>>>>> origin/main
  ]),
]);

export default eslintConfig;
