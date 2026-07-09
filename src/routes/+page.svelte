<script lang="ts">
  import { SearchX } from "@lucide/svelte";
  import {
    getGeneration,
    getPokemon,
    getType,
    listPokemon,
  } from "$lib/api/client";
  import type { Pokemon } from "$lib/api/schemas";
  import CardSkeleton from "$lib/components/CardSkeleton.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import PokedexToolbar from "$lib/components/PokedexToolbar.svelte";
  import PokemonCard from "$lib/components/PokemonCard.svelte";
  import { PAGE_SIZE, TOTAL_POKEMON } from "$lib/constants";
  import { filterEntries, sortPokemon, toDexEntries } from "$lib/pokedex";
  import type { DexEntry, Filters, SortMode } from "$lib/pokedex";

  let entries = $state<DexEntry[]>([]);
  let entriesError = $state<string | null>(null);
  let bootLoading = $state(true);

  let filters = $state<Filters>({ query: "", generation: null, types: [] });
  let sort = $state<SortMode>("dex");

  let genNames = $state<Set<string> | null>(null);
  let typeNameSets = $state<Set<string>[]>([]);

  const details = $state<Record<string, Pokemon>>({});
  const pending = new Set<string>();
  let loadedCount = $state(PAGE_SIZE);

  function loadEntries() {
    listPokemon(TOTAL_POKEMON + 200, 0)
      .then((list) => {
        entries = toDexEntries(list.results);
      })
      .catch((error: unknown) => {
        entriesError =
          error instanceof Error ? error.message : "Failed to load Pokédex";
      })
      .finally(() => {
        bootLoading = false;
      });
  }

  // --- Load the full national dex once (names + ids). --------------------
  $effect(() => {
    loadEntries();
  });

  // --- Resolve generation filter → set of species names. -----------------
  $effect(() => {
    const { generation: gen } = filters;
    if (gen === null) {
      genNames = null;
      return;
    }
    let cancelled = false;
    getGeneration(gen)
      .then((g) => {
        if (!cancelled) {
          genNames = new Set(g.pokemon_species.map((s) => s.name));
        }
      })
      .catch(() => {
        if (!cancelled) {
          genNames = new Set();
        }
      });
    return () => {
      cancelled = true;
    };
  });

  // --- Resolve type filters → sets of pokemon names (AND across types). ---
  $effect(() => {
    const { types } = filters;
    if (types.length === 0) {
      typeNameSets = [];
      return;
    }
    let cancelled = false;
    Promise.all(types.map((t) => getType(t)))
      .then((results) => {
        if (!cancelled) {
          typeNameSets = results.map(
            (r) => new Set(r.pokemon.map((p) => p.pokemon.name)),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          typeNameSets = [];
        }
      });
    return () => {
      cancelled = true;
    };
  });

  const candidates = $derived(
    filterEntries(entries, filters, genNames, typeNameSets).toSorted(
      (a, b) => a.id - b.id,
    ),
  );

  // Reset paging whenever the candidate set identity changes.
  const filterKey = $derived(
    `${filters.query}|${filters.generation}|${filters.types.join(",")}`,
  );
  $effect(() => {
    void filterKey;
    loadedCount = PAGE_SIZE;
  });

  const windowEntries = $derived(candidates.slice(0, loadedCount));

  // --- Lazily fetch detail for every entry in the current window. --------
  $effect(() => {
    for (const entry of windowEntries) {
      if (details[entry.name] || pending.has(entry.name)) {
        continue;
      }
      pending.add(entry.name);
      getPokemon(entry.name)
        .then((p) => {
          details[entry.name] = p;
        })
        .catch(() => {
          /* leave as skeleton; one broken entry shouldn't break the grid */
        })
        .finally(() => {
          pending.delete(entry.name);
        });
    }
  });

  const loadedDetails = $derived(
    windowEntries
      .map((e) => details[e.name])
      .filter((p): p is Pokemon => Boolean(p)),
  );
  const displayed = $derived(sortPokemon(loadedDetails, sort));
  const skeletonCount = $derived(windowEntries.length - loadedDetails.length);
  const hasMore = $derived(loadedCount < candidates.length);

  // --- Infinite scroll sentinel. -----------------------------------------
  let sentinel = $state<HTMLDivElement | null>(null);
  $effect(() => {
    const node = sentinel;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      (obsEntries) => {
        if (obsEntries[0]?.isIntersecting && loadedCount < candidates.length) {
          loadedCount = Math.min(candidates.length, loadedCount + PAGE_SIZE);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  });

  function retry() {
    entriesError = null;
    bootLoading = true;
    loadEntries();
  }

  function clearFilters() {
    filters = { query: "", generation: null, types: [] };
  }
</script>

<svelte:head>
  <title>Pokédex — browse every Pokémon</title>
  <meta
    name="description"
    content="Browse, search, filter and favorite over 1300 Pokémon with live data from the PokeAPI."
  />
</svelte:head>

<section class="hero">
  <h1>Pokédex</h1>
  <p>
    Every Pokémon, searchable and filterable — powered by the PokeAPI, built with
    SvelteKit.
  </p>
</section>

<PokedexToolbar
  bind:filters
  bind:sort
  count={candidates.length}
  total={entries.length}
  loading={bootLoading}
/>

{#if entriesError}
  <EmptyState title="Couldn't reach the Pokédex" description={entriesError}>
    {#snippet action()}
      <button type="button" class="retry" onclick={retry}>Try again</button>
    {/snippet}
  </EmptyState>
{:else if !bootLoading && candidates.length === 0}
  <EmptyState
    title="No Pokémon match your filters"
    description="Try a different name, generation, or type combination."
  >
    {#snippet icon()}
      <SearchX size={40} />
    {/snippet}
    {#snippet action()}
      <button type="button" class="retry" onclick={clearFilters}>
        Clear filters
      </button>
    {/snippet}
  </EmptyState>
{:else}
  <div class="grid">
    {#each displayed as pokemon, i (pokemon.id)}
      <PokemonCard {pokemon} eager={i < 8} />
    {/each}
    {#each { length: skeletonCount } as _skeleton, i (`sk-${i}`)}
      <CardSkeleton />
    {/each}
    {#if bootLoading}
      {#each { length: PAGE_SIZE } as _boot, i (`boot-${i}`)}
        <CardSkeleton />
      {/each}
    {/if}
  </div>
  {#if hasMore}
    <div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>
  {/if}
{/if}

<style>
  .hero {
    margin-bottom: 1.25rem;
  }
  .hero h1 {
    font-size: clamp(1.9rem, 5vw, 2.6rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(120deg, var(--text), var(--accent));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .hero p {
    color: var(--text-muted);
    max-width: 42rem;
    margin-top: 0.25rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 0.9rem;
  }

  .sentinel {
    height: 1px;
  }

  .retry {
    padding: 0.6rem 1.3rem;
    border-radius: 0.7rem;
    background: var(--accent);
    color: var(--accent-contrast);
    font-weight: 700;
    cursor: pointer;
  }
</style>
