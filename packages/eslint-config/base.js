import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

/**
 * Shared flat ESLint config for the whole monorepo.
 *
 * Uses the (non type-checked) recommended rule sets for speed and to avoid
 * per-package `parserOptions.project` wiring. Prettier owns formatting, so
 * `eslint-config-prettier` disables any stylistic rules that would conflict.
 */
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/generated/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/logs/**",
      "**/*.log",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // High-signal correctness rules stay as errors (from recommended);
      // the noisiest stylistic/loose-typing rules are downgraded to warnings
      // so `turbo run lint` gives an actionable baseline rather than a wall.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "prefer-const": "warn",
      // Surfaces pre-existing duplicate permission/message string values as
      // warnings. These need a domain decision to resolve; promote back to
      // "error" once the existing duplicates are cleaned up.
      "@typescript-eslint/no-duplicate-enum-values": "warn",
    },
  },
  eslintConfigPrettier,
);
