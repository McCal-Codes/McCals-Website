import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public-vite/**',
      '.storybook/**',
      'api/**/dist/**',
      'src/**/dist/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2025,
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-unused-labels': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-useless-return': 'error',
      'no-void': 'error',
      'no-with': 'error',
      'radix': 'error',
      'yoda': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    // Server code is excluded here so it does not inherit browser globals on
    // top of the node ones below. Flat config merges `globals` from every
    // matching block rather than replacing it, so without this an api handler
    // could reference `location`, `document` or `window`, no-undef would stay
    // silent, and it would throw a ReferenceError only at runtime. That is
    // exactly how a free `location` reached production and silently broke every
    // booking confirmation email.
    ignores: ['api/**', 'scripts/**', 'api-server.cjs', 'src/content/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-unused-labels': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-useless-return': 'error',
      'no-void': 'error',
      'no-with': 'error',
      'radix': 'error',
      'yoda': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['*.config.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: [
      'api/**/*.{js,ts}',
      'api-server.cjs',
      'scripts/**/*.{js,ts}',
      'src/content/**/*.js',
    ],
    // Carries the recommended rules itself, because the block above no longer
    // matches these paths. Without this, no-undef is not enabled for server
    // code at all.
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
      'no-unmodified-loop-condition': 'off',
    },
  },
  {
    // Playwright driver. Its page.evaluate and page.addInitScript callbacks are
    // serialised and run inside the browser, so window and document really are
    // in scope there even though the file itself runs under node.
    files: ['scripts/check-performance-budget.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  }
);
