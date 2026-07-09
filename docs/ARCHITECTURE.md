# Architecture

## Overview

A **static single-page application**. There is no server at runtime — the whole app is prerendered to a handful of files and served from GitHub Pages. All data comes from the public [PokeAPI](https://pokeapi.co) and is fetched, validated and cached entirely in the browser.

```
Browser ──> SvelteKit SPA ──> fetch() ──> cache (Map) ──> zod parse ──> UI
                                  │
                                  └──> PokeAPI (pokeapi.co) + jsDelivr sprite CDN
```

## Rendering & routing

- **`@sveltejs/adapter-static`** in SPA mode: `fallback: '404.html'`.
- The root layout sets `prerender = true` and `ssr = false`, so SvelteKit emits a prerendered **app shell** (`index.html`) plus the `404.html` fallback. Nothing is server-rendered; components run in the browser.
- `paths.base = '/pokedex-tw-opus-off'` (the project-Pages subpath) in production, `''` in dev. All internal links go through a `href()` helper that prefixes `base`.
- **Deep links** (e.g. `/pokemon/pikachu`) aren't prerendered. GitHub Pages serves `404.html` for unknown paths; that file boots the SPA, which then client-routes to the correct page. The dynamic routes set `prerender = false`.

### Route map

| Route | Prerender | Purpose |
| --- | --- | --- |
| `/` | shell | Pokédex list — search, filters, sort, infinite scroll |
| `/pokemon/[name]` | client only | Detail — stats, abilities, evolution, cry |
| `/berries` | shell | Berries index |
| `/berries/[name]` | client only | Berry detail — flavors, facts |
| `/favorites` | shell | Favorited Pokémon (from `localStorage`) |
| `/*` (unknown) | `404.html` | SPA fallback + friendly error page |

## Data layer (`src/lib/api/`)

**`cache.ts`** — `cachedFetch(url, parse)`:

1. Return the memoized parsed value if the URL is already cached.
2. Otherwise, if a request for that URL is **in flight**, return that same promise (de-duplication — a 30-card page firing 30 detail fetches shares one request per URL).
3. Otherwise `fetch`, throw a typed `ApiError` on a non-ok response, `parse` the JSON, memoize and return. The in-flight entry is cleared by identity so a racing forced refetch can't evict a newer request.

**`schemas.ts`** — one **zod** schema per PokeAPI shape consumed (pokemon, species, evolution-chain, type, generation, berry, list envelope). Unknown keys are stripped, so the schemas stay resilient to API additions. Every response is `parse`d, so bad data fails loudly at the boundary rather than deep in the UI.

**`client.ts`** — thin typed functions (`getPokemon`, `getSpecies`, `getEvolutionChain`, `getType`, `getGeneration`, `listBerries`, `getBerry`, …) that compose `cachedFetch` + a schema. Also holds sprite-URL helpers: PokeAPI serves sprites from `raw.githubusercontent.com`, which rate-limits (429) under bursty grid loads, so URLs are rewritten to the **jsDelivr** CDN mirror (with an automatic fall-back to raw GitHub if jsDelivr 403s an individual file).

## List page data flow (`/`)

1. On mount, fetch the **full national dex** once (`/pokemon?limit=…`) → a light `{ name, id }[]`.
2. Derive `candidates` by applying the active filters (name search, generation name-set, intersected type name-sets), sorted by dex id.
3. `windowEntries = candidates.slice(0, loadedCount)`. An IntersectionObserver sentinel grows `loadedCount` by 30 as the user scrolls.
4. For each windowed entry, lazily `getPokemon(name)` (cached) to fill a reactive `details` record. Each grid cell is a **skeleton until its detail loads, then a card in the same slot** — stable ordering means zero layout shift.

Generation and type filters fetch their member lists on demand (`/generation/{id}`, `/type/{name}`) and cache them; the async effects use a `cancelled` flag so a fast filter change can't apply a stale result.

## State (`src/lib/stores/`)

Two rune-based singletons, both guarded by `$app/environment`'s `browser` flag:

- **`theme.svelte.ts`** — `'light' | 'dark'`, initialised from `localStorage` then the OS preference. The root layout's `$effect` reflects it onto `<html data-theme>` and persists it. An inline script in `app.html` applies the stored theme **before first paint** to avoid a flash.
- **`favorites.svelte.ts`** — a `number[]` of dex ids, persisted to `localStorage` on every mutation; the favorites page and the heart buttons all read the same reactive source.

## Styling & motion

Tailwind v4 (via `@tailwindcss/vite`) for utilities, plus a hand-written design system in `app.css`: CSS custom properties for light/dark surfaces, the 18 type brand colors, shadows and easing curves. Animations are CSS/Svelte transitions (stat bars, card hover, entrances, skeleton shimmer) and every one is disabled under `@media (prefers-reduced-motion: reduce)`.

## Testing

- **vitest** (jsdom) unit-tests the pure logic: cache (with a mocked `fetch`, including in-flight de-dup), zod schemas, the filter/sort/evolution helpers, formatting, contrast, and the favorites store.
- **Playwright** drives the real app end-to-end: list, search, generation filter, detail + evolution, favorite persistence across reload, theme persistence, and berries.
