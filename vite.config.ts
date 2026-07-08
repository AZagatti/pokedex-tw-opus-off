import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.{test,spec}.ts"],
          exclude: ["src/**/*.svelte.{test,spec}.ts"],
        },
      },
    ],
  },
});
