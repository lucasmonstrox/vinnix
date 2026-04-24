import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import noUnsanitized from "eslint-plugin-no-unsanitized"
import onlyWarn from "eslint-plugin-only-warn"
import perfectionist from "eslint-plugin-perfectionist"
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
  {
    plugins: {
      turbo: turboPlugin,
      "security-node": securityNode,
      perfectionist,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      complexity: ["error", { max: 10 }],
      "sonarjs/cognitive-complexity": ["error", 15],
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
