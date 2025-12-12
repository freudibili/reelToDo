import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";
import globals from "globals";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tsRecommendedRules = tsPlugin.configs.recommended.rules ?? {};
const reactRecommendedRules = react.configs.recommended.rules ?? {};
const reactHooksRecommendedRules = reactHooks.configs.recommended.rules ?? {};
const reactNativeRecommendedRules = reactNative.configs.recommended?.rules ?? {};
const importRecommendedRules = importPlugin.configs.recommended.rules ?? {};
const importTypescriptRules = importPlugin.configs.typescript.rules ?? {};

export default [
  {
    ignores: [
      "node_modules",
      "android",
      "ios",
      ".expo",
      "dist",
      "build",
      "supabase/functions",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        __DEV__: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      react,
      "react-hooks": reactHooks,
      "react-native": reactNative,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsRecommendedRules,
      ...reactRecommendedRules,
      ...reactHooksRecommendedRules,
      ...reactNativeRecommendedRules,
      ...importRecommendedRules,
      ...importTypescriptRules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-native/no-inline-styles": "off",
      "react-native/no-color-literals": "off",
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
];
