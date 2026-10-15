import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Izolowane kopie robocze agentów, każda z własnym .next — to nie nasz kod.
    ".claude/**",
    // Lokalne archiwum starej strony (poza repo).
    "archiwum-wix/**",
  ]),
]);

export default eslintConfig;
