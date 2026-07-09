# Decisions

Why each pinned technology was used, and where reality forced a documented
deviation.

## Pinned choices

### SvelteKit (Svelte 5 runes) + TypeScript strict

Svelte 5's runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`) give
fine-grained reactivity with almost no boilerplate — ideal for the list page's
lazily-filled grid and the two persisted stores. `strict` TypeScript catches the
PokeAPI's many nullable fields at compile time.

### `@sveltejs/adapter-static` — SPA mode

GitHub Pages serves static files only. Adapter-static with `fallback: '404.html'`
prerenders the app shell and lets GitHub Pages serve that shell for any deep link
(Pages returns `404.html` for unknown paths). `ssr = false` keeps data-fetching
in the browser (no build-time PokeAPI calls) and keeps the build fast and
deterministic. `paths.base` is the repo name for project Pages.

### Tailwind CSS v4 + hand-written CSS

Tailwind v4 (through `@tailwindcss/vite`, no config file — theme lives in
`@theme` inside `app.css`) covers layout/spacing utilities. Motion, the type
color system and the light/dark token set are hand-written CSS, which is clearer
than utility soup for keyframes and `color-mix()` gradients.

### native `fetch` + a tiny `Map` cache + zod

No data-fetching library, as pinned. The cache is a URL-keyed `Map` with
in-flight de-duplication (see [ARCHITECTURE](ARCHITECTURE.md)). **zod** parses
every response against a schema-per-shape, so malformed data fails at the API
boundary instead of surfacing as a confusing render error.

### Runes + localStorage stores

Theme and favorites are rune-based singletons persisted to `localStorage`,
guarded by SvelteKit's `browser` flag so they're SSR/prerender-safe.

### ultracite → oxlint + oxfmt

The fastest lint/format toolchain. `ultracite init --linter oxlint` wires
`oxlint.config.ts` (extending `ultracite/oxlint/core` + `svelte`) and
`oxfmt.config.ts`. Scripts: `lint`, `format`, `check`.

### lefthook

`pre-commit` runs oxlint + oxfmt (`--check`) + `svelte-check` on the commit;
`pre-push` runs the full test suite. Fast, parallel, single binary.

### vitest + Playwright

vitest for pure-logic unit tests (jsdom); Playwright to drive the real app.

### GitHub Actions → Pages

One workflow: install → lint → format-check → typecheck → unit → e2e → build →
`upload-pages-artifact` + `deploy-pages` (with `pages: write`, `id-token:
write`). Pages is enabled with `build_type=workflow`.

---

## Deviations (and why)

### `lucide-svelte` → `@lucide/svelte`

The spec pinned `lucide-svelte`, but on npm `lucide-svelte@1.0.1` is a
**deprecation stub** — its own `package.json` says _"Package deprecated. Please
use @lucide/svelte instead."_ and it ships only a handful of working icons
(`svelte-check` errored on missing exports). `@lucide/svelte` (v1.x, ~1700 icons)
is the actual Svelte-5 lucide package with the identical import API. Switching
preserves the intent (lucide icons) while keeping the app working. Lucide also
dropped brand icons, so the GitHub mark in the footer is an inline SVG.

### Sprites via the jsDelivr CDN, not `raw.githubusercontent.com`

PokeAPI returns sprite URLs on `raw.githubusercontent.com`, which **rate-limits
(HTTP 429)** when a 30-card grid requests 30 images at once — images appeared
broken. URLs are rewritten to the equivalent **jsDelivr** mirror (a real CDN, no
throttling, faster — good for the LCP too), with an automatic per-image fallback
back to raw GitHub for the few files jsDelivr occasionally 403s.

### Tuned a few oxlint rules

`ultracite/oxlint/core` is intentionally strict. A small number of rules were
turned off where they fight framework conventions or are purely stylistic;
everything else was fixed in code:

- `func-style`, `sort-keys` — stylistic; function declarations and
  logically-ordered config objects read better.
- `prefer-await-to-then` / `prefer-await-to-callbacks` — `$effect` cleanup must
  be synchronous, so promise chains with a `cancelled` flag are the idiomatic
  async pattern inside effects.
- `unicorn/filename-case` (for `**/*.svelte`) — Svelte components are PascalCase
  by universal convention; kebab-case would fight the ecosystem.
- `prefer-const` (for `**/*.svelte`) — oxlint misreads the `let { … } = $props()`
  rune idiom as never-reassigned.
- The **`ultracite/oxlint/vitest` preset was removed entirely**: its rules can't
  be scoped per file and misfire on Playwright specs (one rule literally demanded
  importing _vitest_ globals into `@playwright/test` files). Core + svelte still
  lint the tests.

### Accessible type-badge text

White text failed WCAG-AA contrast on light type colors (electric, ice, ground).
A luminance-based `readableTextOn()` picks near-black or white per type, and a
dedicated darker `--accent-ink` token is used for accent-colored text — getting
the Lighthouse Accessibility score to 100.
