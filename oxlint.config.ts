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
    // `$effect` cleanup must be synchronous, so promise chains with a cancelled
    // flag are the idiomatic async pattern inside effects — allow `.then()` and
    // `.catch()` callbacks.
    "prefer-await-to-then": "off",
    "prefer-await-to-callbacks": "off",
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
      // Svelte components are conventionally PascalCase; the rune props idiom is
      // `let { ... } = $props()` which oxlint misreads as never-reassigned.
      files: ["**/*.svelte"],
      rules: {
        "prefer-const": "off",
        "filename-case": "off",
      },
    },
  ],
});
