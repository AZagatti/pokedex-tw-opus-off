import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const dev = process.argv.includes("dev");

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true,
  },
  kit: {
    adapter: adapter({
      fallback: "404.html",
      precompress: false,
      strict: false,
    }),
    paths: {
      base: dev ? "" : "/pokedex-tw-opus-off",
      relative: false,
    },
  },
};

export default config;
