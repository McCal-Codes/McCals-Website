import js from "@eslint/js";
import globals from "globals";

// Flat config for ESLint 8.57.x (no "eslint/config" export yet)
export default [
  {
    ignores: ["dist/**", "node_modules/**", "logs/**", "coverage/**", "scripts/_archived/**"],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ...js.configs.recommended.languageOptions?.parserOptions,
        ecmaVersion: 2022,
        sourceType: "script",
        allowHashBang: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-useless-escape": "off",
      "no-constant-condition": ["warn"],
    },
  },
];
