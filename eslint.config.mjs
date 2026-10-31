import js from "@eslint/js";
import globals from "globals";

// Flat config for ESLint 9.x
export default [
  {
    ignores: [
      "dist/**",
      "logs/**",
      "coverage/**",
      "reports/**",
      "test-results/**",
      "scripts/_archived/**",
      "src/api/scripts/_website-scripts-archived/**",
      "**/build/**",
      "**/out/**",
      "**/dist/**",
      "sites/**/dist/**",
      "scripts/utils/shared-date-parsing.js",

      // Bundled/build outputs
      "thesis/interactive/**",

      // Nested/duplicated source trees (historical packaging artifacts)
      "src/api/src/**",

      // Never lint dependencies or framework build output (including nested apps)
      "**/node_modules/**",
      "**/.next/**",

      // Optional: tool UIs may be vendored / Electron-specific; keep them out of repo-wide lint
      "tools/image-compress/**",

      // Archived admin code
      "admin/_archived/**",
    ],
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
        ecmaVersion: 2025,
        sourceType: "module",
        allowHashBang: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-useless-escape": "off",
      "no-constant-condition": ["warn"],
      "no-empty": "warn",
      "no-useless-assignment": "warn",
      "preserve-caught-error": "off",
    },
  },
];
