import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import svelte from "ultracite/oxlint/svelte";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, svelte, vitest],
  ignorePatterns: [
    ...core.ignorePatterns,
    ".svelte-kit/**",
    "build/**",
    "test-results/**",
    "playwright-report/**",
  ],
  rules: {
    // Purely stylistic and fights semantically meaningful config/object ordering.
    "sort-keys": "off",
    // Allow `function foo()` declarations (hoisting + cleaner generics) instead
    // of forcing every helper into an arrow const.
    "func-style": "off",
  },
  overrides: [
    {
      // Ambient type declarations need `export {}` to be treated as modules.
      files: ["**/*.d.ts"],
      rules: {
        "require-module-specifiers": "off",
      },
    },
    {
      // Svelte 5 rune props idiom is `let { ... } = $props()`; oxlint parses only
      // the <script> block generically and misreads props as never-reassigned.
      files: ["**/*.svelte"],
      rules: {
        "prefer-const": "off",
      },
    },
  ],
});
