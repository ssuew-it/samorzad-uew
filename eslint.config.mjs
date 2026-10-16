import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Hook z biblioteki motion przy pierwszym renderze zwraca prawdziwe
      // ustawienie, a serwer go nie zna — przy ograniczonym ruchu dawało to
      // błąd hydratacji #418. Nasz hook jest na to odporny.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "motion/react",
              importNames: ["useReducedMotion"],
              message: 'Użyj useReducedMotion z "@/lib/use-reduced-motion" (bezpieczny dla hydratacji).',
            },
          ],
        },
      ],
    },
  },
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
