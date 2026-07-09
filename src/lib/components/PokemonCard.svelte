<script lang="ts">
  import type { Pokemon } from "$lib/api/schemas";
  import { typeColor } from "$lib/constants";
  import { dexNumber, bestSprite, titleCase } from "$lib/format";
  import { href } from "$lib/paths";
  import FavoriteButton from "./FavoriteButton.svelte";
  import PokemonImage from "./PokemonImage.svelte";
  import TypeBadge from "./TypeBadge.svelte";

  interface Props {
    pokemon: Pokemon;
    eager?: boolean;
  }

  let { pokemon, eager = false }: Props = $props();

  const primaryType = $derived(pokemon.types[0]?.type.name ?? "normal");
  const display = $derived(titleCase(pokemon.name));
</script>

<a
  class="card card-surface"
  href={href(`/pokemon/${pokemon.name}`)}
  style="--type-color: {typeColor(primaryType)};"
  data-sveltekit-preload-data="hover"
>
  <div class="glow" aria-hidden="true"></div>
  <div class="top">
    <span class="dex tabular">{dexNumber(pokemon.id)}</span>
    <FavoriteButton id={pokemon.id} name={display} size={17} />
  </div>

  <div class="art">
    <PokemonImage src={bestSprite(pokemon)} alt={display} {eager} size="100%" />
  </div>

  <h2 class="name">{display}</h2>

  <div class="types">
    {#each pokemon.types as t (t.type.name)}
      <TypeBadge type={t.type.name} size="sm" />
    {/each}
  </div>
</a>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.85rem;
    text-decoration: none;
    color: var(--text);
    overflow: hidden;
    isolation: isolate;
    transition:
      transform 0.22s var(--ease-out-soft),
      box-shadow 0.22s var(--ease-out-soft),
      border-color 0.22s ease;
  }

  .glow {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(
      circle at 50% 18%,
      color-mix(in srgb, var(--type-color) 26%, transparent),
      transparent 62%
    );
    opacity: 0.7;
    transition: opacity 0.22s ease;
  }

  @media (hover: hover) {
    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: color-mix(in srgb, var(--type-color) 45%, var(--border));
    }
    .card:hover .glow {
      opacity: 1;
    }
    .card:active {
      transform: translateY(-1px) scale(0.99);
    }
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dex {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-muted);
  }

  .art {
    width: 100%;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    padding: 0.25rem 1rem;
  }

  .name {
    font-size: 1.02rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.25;
    /* Reserve a constant two-line block so long names never reflow the grid. */
    min-height: 2.55rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .types {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.3rem;
    min-height: 1.35rem;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    .card:hover {
      transform: none;
    }
  }
</style>
