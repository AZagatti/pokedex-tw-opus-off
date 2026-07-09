<script lang="ts">
  import { ArrowUpDown, Search, X } from "@lucide/svelte";
  import {
    GENERATIONS,
    POKEMON_TYPES,
    readableTextOn,
    typeColor,
  } from "$lib/constants";
  import type { Filters, SortMode } from "$lib/pokedex";
  import { hasActiveFilters } from "$lib/pokedex";

  interface Props {
    filters: Filters;
    sort: SortMode;
    count: number;
    total: number;
    loading?: boolean;
  }

  let {
    filters = $bindable(),
    sort = $bindable(),
    count,
    total,
    loading = false,
  }: Props = $props();

  // Debounced search: local input mirrors filters.query with a 250ms delay.
  let searchInput = $state(filters.query);
  let lastSynced = filters.query;

  // Re-sync the visible input when filters.query changes from elsewhere
  // (e.g. the "Clear filters" empty-state button resets the whole object).
  $effect(() => {
    if (filters.query !== lastSynced) {
      searchInput = filters.query;
      lastSynced = filters.query;
    }
  });

  $effect(() => {
    const value = searchInput;
    const timer = setTimeout(() => {
      lastSynced = value;
      filters.query = value;
    }, 250);
    return () => clearTimeout(timer);
  });

  const active = $derived(hasActiveFilters(filters));

  function toggleType(type: string) {
    filters.types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
  }

  function onGenerationChange(event: Event) {
    const { value } = event.currentTarget as HTMLSelectElement;
    filters.generation = value ? Number(value) : null;
  }

  function clearAll() {
    searchInput = "";
    filters.query = "";
    filters.generation = null;
    filters.types = [];
  }
</script>

<div class="toolbar">
  <div class="row primary">
    <div class="search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        placeholder="Search Pokémon by name…"
        bind:value={searchInput}
        aria-label="Search Pokémon by name"
        autocomplete="off"
        spellcheck="false"
      />
      {#if searchInput}
        <button
          type="button"
          class="clear-input"
          onclick={() => (searchInput = "")}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      {/if}
    </div>

    <label class="gen">
      <span class="sr-only">Filter by generation</span>
      <select onchange={onGenerationChange} aria-label="Filter by generation">
        <option value="" selected={filters.generation === null}>All gens</option
        >
        {#each GENERATIONS as gen (gen.id)}
          <option value={gen.id} selected={filters.generation === gen.id}>
            {gen.label} · {gen.region}
          </option>
        {/each}
      </select>
    </label>

    <button
      type="button"
      class="sort"
      onclick={() => (sort = sort === "dex" ? "stat" : "dex")}
      aria-label="Change sort order"
      title="Toggle sort order"
    >
      <ArrowUpDown size={16} aria-hidden="true" />
      <span>{sort === "dex" ? "Dex №" : "Stat total"}</span>
    </button>
  </div>

  <div class="row types" role="group" aria-label="Filter by type">
    {#each POKEMON_TYPES as type (type)}
      <button
        type="button"
        class="type-chip"
        class:on={filters.types.includes(type)}
        style="--tc: {typeColor(type)}; --tc-text: {readableTextOn(type)};"
        onclick={() => toggleType(type)}
        aria-pressed={filters.types.includes(type)}
      >
        {type}
      </button>
    {/each}
  </div>

  <div class="row meta">
    <span class="count" aria-live="polite">
      {#if loading}
        Loading…
      {:else}
        <b>{count}</b>
        {count === 1 ? "Pokémon" : "Pokémon"}
        {#if active}<span class="dim">of {total}</span>{/if}
      {/if}
    </span>
    {#if active}
      <button type="button" class="clear-all" onclick={clearAll}>
        <X size={14} aria-hidden="true" /> Clear filters
      </button>
    {/if}
  </div>
</div>

<style>
  .toolbar {
    position: sticky;
    top: 3.35rem;
    z-index: 40;
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    backdrop-filter: saturate(180%) blur(12px);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 0.75rem;
    margin-bottom: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    box-shadow: var(--shadow-sm);
  }

  .row {
    display: flex;
    gap: 0.5rem;
  }
  .primary {
    flex-wrap: wrap;
  }

  .search {
    position: relative;
    flex: 1 1 16rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.7rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.7rem;
    color: var(--text-faint);
    transition: border-color 0.15s ease;
  }
  .search:focus-within {
    border-color: var(--accent);
  }
  .search input {
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--text);
    font-size: 1rem; /* 16px to avoid iOS zoom */
    padding: 0.6rem 0;
    outline: none;
  }
  .clear-input {
    display: grid;
    place-items: center;
    color: var(--text-faint);
    padding: 0.15rem;
    border-radius: 999px;
    cursor: pointer;
  }
  .clear-input:hover {
    color: var(--text);
  }

  select,
  .sort {
    height: 100%;
    min-height: 2.6rem;
    padding: 0 0.9rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.7rem;
    color: var(--text);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
  }
  .sort {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    white-space: nowrap;
  }
  @media (hover: hover) {
    .sort:hover,
    select:hover {
      background: var(--bg-subtle);
    }
  }

  .types {
    flex-wrap: wrap;
  }
  .type-chip {
    text-transform: capitalize;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.28rem 0.6rem;
    border-radius: 999px;
    border: 1.5px solid color-mix(in srgb, var(--tc) 45%, var(--border));
    background: var(--bg-elevated);
    color: var(--text-muted);
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      transform 0.12s var(--ease-spring);
  }
  @media (hover: hover) {
    .type-chip:hover {
      color: var(--text);
      background: color-mix(in srgb, var(--tc) 14%, var(--bg-elevated));
    }
  }
  .type-chip.on {
    background: var(--tc);
    color: var(--tc-text);
    border-color: var(--tc);
  }

  .meta {
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
    color: var(--text-muted);
  }
  .count b {
    color: var(--text);
  }
  .dim {
    color: var(--text-faint);
  }
  .clear-all {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--accent);
    cursor: pointer;
    padding: 0.3rem 0.5rem;
    border-radius: 0.5rem;
  }
  @media (hover: hover) {
    .clear-all:hover {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }

  @media (prefers-reduced-motion: reduce) {
    .type-chip {
      transition: background 0.15s ease;
    }
  }
</style>
