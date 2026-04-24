import js from "@eslint/js"
import stylistic from "@stylistic/eslint-plugin"
import eslintConfigPrettier from "eslint-config-prettier"
import checkFile from "eslint-plugin-check-file"
import noSecrets from "eslint-plugin-no-secrets"
import noUnsanitized from "eslint-plugin-no-unsanitized"
import onlyWarn from "eslint-plugin-only-warn"
import perfectionist from "eslint-plugin-perfectionist"
import * as regexpPlugin from "eslint-plugin-regexp"
import security from "eslint-plugin-security"
import securityNode from "eslint-plugin-security-node"
import sonarjs from "eslint-plugin-sonarjs"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  security.configs.recommended,
  noUnsanitized.configs.recommended,
  regexpPlugin.configs["flat/recommended"],
  {
    plugins: {
      turbo: turboPlugin,
      "security-node": securityNode,
      perfectionist,
      "check-file": checkFile,
      "no-secrets": noSecrets,
      "@stylistic": stylistic,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      complexity: ["error", { max: 10 }],
      "sonarjs/cognitive-complexity": ["error", 15],
      "max-params": "off",
      "@typescript-eslint/max-params": ["error", { max: 2 }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      "no-nested-ternary": "error",
      "no-param-reassign": ["error", { props: true }],
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx,js,jsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "no-secrets/no-secrets": ["error", { tolerance: 4.2 }],
      "max-lines-per-function": [
        "error",
        { max: 60, skipBlankLines: true, skipComments: true },
      ],
      "max-len": "off",
      "@stylistic/max-len": [
        "error",
        {
          code: 80,
          ignoreUrls: true,
          ignoreRegExpLiterals: true,
          ignoreStrings: false,
          ignoreTemplateLiterals: false,
          ignoreComments: false,
        },
      ],
      "perfectionist/sort-imports": [
        "error",
        { type: "alphabetical", order: "asc" },
      ],
      "perfectionist/sort-named-imports": [
        "error",
        { type: "alphabetical", order: "asc" },
      ],
      "perfectionist/sort-named-exports": [
        "error",
        { type: "alphabetical", order: "asc" },
      ],
      "perfectionist/sort-union-types": [
        "error",
        { type: "alphabetical", order: "asc" },
      ],
      "perfectionist/sort-enums": [
        "error",
        { type: "alphabetical", order: "asc" },
      ],
      ...securityNode.configs.recommended.rules,
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
  },
]
