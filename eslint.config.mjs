import js from "@eslint/js";
import globals from "globals";

// Flat config for ESLint 8.57.x (no "eslint/config" export yet)
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

      // Some widgets ship legacy/versioned JS bundles; keep repo-wide lint focused on maintained source
      "src/widgets/**/versions/**/*.js",

      // Nested/duplicated source trees (historical packaging artifacts)
      "src/api/src/**",

      // Never lint dependencies or framework build output (including nested apps)
      "**/node_modules/**",
      "**/.next/**",

      // Optional: tool UIs may be vendored / Electron-specific; keep them out of repo-wide lint
      "tools/image-compress/**",
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
