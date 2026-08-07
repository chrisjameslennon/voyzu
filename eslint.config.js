import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/*.tsbuildinfo",
      "internal/**",
      "docs/**",
      "infra/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
    rules: {
      "no-empty": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@voyzu/*/src/*"],
              message: "Import from package exports, not package source paths.",
            },
          ],
        },
      ],
    },
  },
];
