import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^([A-Z_]|motion$)",
          argsIgnorePattern: "^([A-Z_]|motion$)",
        },
      ],
      "react-refresh/only-export-components": "warn",
    },
  },
  {
    // Pre-existing effect-timing patterns (animation kickoff, data-fetch-on-mount)
    // that predate the react-hooks/set-state-in-effect and react-hooks/refs rules.
    // Not refactoring behavior here — just acknowledging these as known exceptions.
    files: [
      "src/components/admin/CountUpNumber.jsx",
      "src/hooks/useRepos.js",
      "src/components/animate-ui/icons/icon.jsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
]);
