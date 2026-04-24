import path from "node:path"
import { fileURLToPath } from "node:url"

import pluginNext from "@next/eslint-plugin-next"
import pluginTailwind from "eslint-plugin-better-tailwindcss"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import globals from "globals"

import { config as baseConfig } from "./base.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tailwindEntryPoint = path.resolve(
  __dirname,
  "../ui/src/styles/globals.css"
)

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
  ...baseConfig,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-multi-comp": ["error", { ignoreStateless: false }],
    },
  },
  {
    plugins: {
      "better-tailwindcss": pluginTailwind,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: tailwindEntryPoint,
      },
    },
    rules: {
      ...pluginTailwind.configs["recommended-error"].rules,
      "better-tailwindcss/enforce-consistent-line-wrapping": [
        "error",
        { printWidth: 80 },
      ],
    },
  },
]
