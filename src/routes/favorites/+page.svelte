<script lang="ts">
  import { Heart } from "@lucide/svelte";
  import { getPokemon } from "$lib/api/client";
  import type { Pokemon } from "$lib/api/schemas";
  import CardSkeleton from "$lib/components/CardSkeleton.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import PokemonCard from "$lib/components/PokemonCard.svelte";
  import { favorites } from "$lib/stores/favorites.svelte";
  import { href } from "$lib/paths";

  const details = $state<Record<number, Pokemon>>({});
  const pending = new Set<number>();

  // Fetch (cached) detail for every favorited id.
  $effect(() => {
    for (const id of favorites.ids) {
      if (details[id] || pending.has(id)) {
        continue;
      }
      pending.add(id);
      getPokemon(id)
        .then((p) => {
          details[id] = p;
        })
        .catch(() => {
          /* keep skeleton for a broken id */
        })
        .finally(() => {
          pending.delete(id);
        });
    }
  });

  const loaded = $derived(
    favorites.ids
      .map((id) => details[id])
      .filter((p): p is Pokemon => Boolean(p)),
  );
  const skeletonCount = $derived(favorites.ids.length - loaded.length);
</script>

<svelte:head>
  <title>Favorites — Pokédex</title>
  <meta name="description" content="Your favorited Pokémon, saved on this device." />
</svelte:head>

<section class="hero">
  <h1>Favorites</h1>
  <p>
    {#if favorites.count > 0}
      {favorites.count}
      {favorites.count === 1 ? "Pokémon" : "Pokémon"} saved on this device.
    {:else}
      Tap the heart on any Pokémon to save it here.
    {/if}
  </p>
</section>

{#if favorites.count === 0}
  <EmptyState
    title="No favorites yet"
    description="Browse the Pokédex and tap the heart on a Pokémon to add it to your favorites. They're saved in this browser."
  >
    {#snippet icon()}
      <Heart size={40} />
    {/snippet}
    {#snippet action()}
      <a class="cta" href={href("/")}>Browse the Pokédex</a>
    {/snippet}
  </EmptyState>
{:else}
  <div class="grid">
    {#each loaded as pokemon, i (pokemon.id)}
      <PokemonCard {pokemon} eager={i < 8} />
    {/each}
    {#each { length: skeletonCount } as _item, i (i)}
      <CardSkeleton />
    {/each}
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
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 0.9rem;
  }
  .cta {
    display: inline-block;
    padding: 0.65rem 1.4rem;
    border-radius: 0.7rem;
    background: var(--accent);
    color: var(--accent-contrast);
    font-weight: 700;
    text-decoration: none;
  }
</style>
