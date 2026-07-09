<script lang="ts">
  import { Search, SearchX } from "@lucide/svelte";
  import { getBerry, listBerries } from "$lib/api/client";
  import type { Berry } from "$lib/api/schemas";
  import CardSkeleton from "$lib/components/CardSkeleton.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import BerryCard from "$lib/components/BerryCard.svelte";
  import { matchesSearch } from "$lib/pokedex";

  let berries = $state<Berry[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let query = $state("");

  function load() {
    loading = true;
    error = null;
    (async () => {
      try {
        const list = await listBerries(1000, 0);
        const details = await Promise.all(
          list.results.map((r) => getBerry(r.name).catch(() => null)),
        );
        berries = details
          .filter((b): b is Berry => b !== null)
          .toSorted((a, b) => a.id - b.id);
      } catch {
        error = "Couldn't load berries. Please try again.";
      } finally {
        loading = false;
      }
    })();
  }

  $effect(() => {
    load();
  });

  const filtered = $derived(
    berries.filter((b) => matchesSearch(b.name, query)),
  );
</script>

<svelte:head>
  <title>Berries — Pokédex</title>
  <meta
    name="description"
    content="Every berry from the Pokémon world — firmness, flavors, growth time and size."
  />
</svelte:head>

<section class="hero">
  <h1>Berries</h1>
  <p>Firmness, flavors, growth time and size for every berry.</p>
</section>

<div class="search">
  <Search size={18} aria-hidden="true" />
  <input
    type="search"
    placeholder="Search berries…"
    bind:value={query}
    aria-label="Search berries by name"
    autocomplete="off"
  />
</div>

{#if error}
  <EmptyState title="Couldn't load berries" description={error}>
    {#snippet action()}
      <button type="button" class="retry" onclick={load}>Try again</button>
    {/snippet}
  </EmptyState>
{:else if !loading && filtered.length === 0}
  <EmptyState title="No berries found" description="Try a different search.">
    {#snippet icon()}
      <SearchX size={40} />
    {/snippet}
  </EmptyState>
{:else}
  <div class="grid">
    {#if loading}
      {#each { length: 12 } as _item, i (i)}
        <CardSkeleton />
      {/each}
    {:else}
      {#each filtered as berry, i (berry.id)}
        <BerryCard {berry} eager={i < 8} />
      {/each}
    {/if}
  </div>
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
  }

  .search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.7rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.7rem;
    color: var(--text-faint);
    margin-bottom: 1.5rem;
    max-width: 24rem;
  }
  .search:focus-within {
    border-color: var(--accent);
  }
  .search input {
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--text);
    font-size: 1rem;
    padding: 0.6rem 0;
    outline: none;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 0.9rem;
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
