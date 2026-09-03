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
  ]),
  {
    // Pre-existing effect-timing patterns in the vendored animate-ui components,
    // predating the react-hooks/set-state-in-effect, react-hooks/refs, and
    // react-hooks/static-components rules. Not refactoring behavior here —
    // just acknowledging these as known exceptions.
    files: [
      "app/(landing)/_animate-ui/icons/icon.tsx",
      "app/(landing)/_animate-ui/primitives/animate/slot.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/static-components": "off",
    },
  },
]);

export default eslintConfig;
