import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  // Next.js core web vitals (includes React, hooks, a11y rules)
  ...nextVitals,
  // TypeScript rules from Next.js
  ...nextTs,
  // Prettier conflict resolution (must be after other configs)
  prettier,
  // Global ignores
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  // Type-aware linting configuration
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript - type-aware rules for catching async bugs
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // React - catch common mistakes
      "react/jsx-key": "error",
      "react/no-array-index-key": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Allow setMounted pattern for hydration (common Next.js pattern)
      "react-hooks/set-state-in-effect": "warn",

      // General JS - prevent bugs
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-var": "error",
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
