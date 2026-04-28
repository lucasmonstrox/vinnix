import path from "node:path"
import { fileURLToPath } from "node:url"

import pluginTailwind from "eslint-plugin-better-tailwindcss"
import pluginReactHooks from "eslint-plugin-react-hooks"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tailwindEntryPoint = path.resolve(
  __dirname,
  "../ui/src/styles/globals.css"
)

/**
 * Shared flat-config blocks for any React-based config (Next.js + plain React).
 * Spread into the consumer's array: `[...baseConfig, ..., ...reactSharedConfig]`.
 */
export const reactSharedConfig = [
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
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "FunctionDeclaration[id.name=/^[A-Z]/] > :matches(Identifier, ObjectPattern).params[typeAnnotation.typeAnnotation.type='TSTypeLiteral']",
          message:
            "Extraia props do componente para um type nomeado.",
        },
        {
          selector:
            "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression > :matches(Identifier, ObjectPattern).params[typeAnnotation.typeAnnotation.type='TSTypeLiteral']",
          message:
            "Extraia props do componente para um type nomeado.",
        },
      ],
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
