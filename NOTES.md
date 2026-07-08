# Build Journal — Pokédex

Running log of anything that looked wrong, rework, confusion, missing context, surprises. One dated bullet per event.

## 2026-07-08

- Session start. Read SPEC.md. Scope: full SvelteKit 5 Pokédex on PokeAPI, adapter-static SPA, Tailwind v4, zod, ultracite(oxlint+oxfmt), lefthook, vitest+Playwright, GH Actions → Pages, Lighthouse ≥90. Remote: `https://github.com/AZagatti/pokedex-tw-opus-off.git`, base `/pokedex-tw-opus-off`.
- Env: node v24.17.0, npm 11.17.0, git 2.43.0, gh 2.92.0. Not a git repo yet.
- Surprise: `sv create` scaffold (v0.16.2, vite-plugin-svelte v7) does NOT generate `svelte.config.js` — it inlines `compilerOptions`/`adapter` into `vite.config.ts`. Confirmed via context7 that kit config (adapter/paths/prerender) still belongs in `svelte.config.js`, so I created one and reduced vite.config to `[tailwindcss(), sveltekit()]`. Build reads svelte.config.js correctly (base path applied to 404.html). Standard path still works.
- npm 11 `allow-scripts` gate blocked lefthook's postinstall (binary didn't install). Fixed with `npm approve-scripts lefthook` → adds `allowScripts` to package.json.
- `lucide-svelte` latest resolved to `1.0.1` (jump from old 0.x line) — noting in case of API differences with Svelte 5. Will verify when first used.
- `npx ultracite init --linter oxlint` generated `oxlint.config.ts` importing `ultracite/oxlint/sveltekit` — that preset does NOT exist (ERR_MODULE_NOT_FOUND). Available presets are `core`, `svelte`, `vitest`, etc. Fixed to import `svelte` + `vitest`.
- ultracite oxlint `core` preset enables very strict stylistic rules: `sort-keys` (fights logical config ordering) and `prefer-const` (misfires on Svelte 5 `let {..} = $props()`). Turned `sort-keys` off globally and `prefer-const` off for `**/*.svelte`; disabled `require-module-specifiers` for `**/*.d.ts` (needs `export {}`). Documented in DECISIONS.md later.
- vite.config `test` key needs `defineConfig` imported from `vitest/config` (not `vite`) or svelte-check errors on unknown property.
- Task 1 DONE: lint/format/check/build all green, lefthook installed & ran green on first commit (adc0c76).
- Confusion: first `git commit` of API layer silently "passed hooks" in my truncated output but did NOT create a commit — the lefthook pre-commit oxlint (run on staged files) actually FAILED; I'd only run `npm run check` (typecheck) after writing the API files, never `npm run lint`, so I missed real lint errors. Lesson: run `npm run lint` after writing code, not just typecheck. lefthook correctly blocked the bad commit.
- ultracite core preset also enables `func-style: expression` (forces every function into an arrow const). Pervasive; disabled it (function declarations hoist + cleaner generics). Fixed the legit rules instead: `require-unicode-regexp` (added `/u`), `prefer-string-replace-all` (replaceAll), `consistent-type-specifier-style` (split `import type`). All documented for DECISIONS.md.
- Task 2 DONE: schemas validated against LIVE PokeAPI (pikachu/pichu evo, cheri berry, fire type all parse).
