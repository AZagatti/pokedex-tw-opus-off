<script lang="ts">
  import { berrySprite } from "$lib/api/client";
  import type { Berry } from "$lib/api/schemas";
  import { dexNumber, titleCase } from "$lib/format";
  import { href } from "$lib/paths";
  import PokemonImage from "./PokemonImage.svelte";

  interface Props {
    berry: Berry;
    eager?: boolean;
  }

  let { berry, eager = false }: Props = $props();

  const display = $derived(titleCase(berry.name));
</script>

<a
  class="card card-surface"
  href={href(`/berries/${berry.name}`)}
  data-sveltekit-preload-data="hover"
>
  <div class="top">
    <span class="dex tabular">{dexNumber(berry.id)}</span>
    <span class="firmness">{titleCase(berry.firmness.name)}</span>
  </div>
  <div class="art">
    <PokemonImage src={berrySprite(berry.name)} alt={`${display} Berry`} {eager} />
  </div>
  <h2 class="name">{display}</h2>
  <p class="sub">
    <span>🌱 {berry.growth_time}h</span>
    <span>📏 {berry.size}mm</span>
  </p>
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
    transition:
      transform 0.22s var(--ease-out-soft),
      box-shadow 0.22s var(--ease-out-soft);
  }
  @media (hover: hover) {
    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
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
  .firmness {
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: capitalize;
    color: var(--text-muted);
    background: var(--bg-subtle);
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
  }
  .art {
    width: 100%;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    padding: 1.2rem;
  }
  .art :global(img) {
    image-rendering: pixelated;
  }
  .name {
    font-size: 1rem;
    font-weight: 700;
  }
  .sub {
    display: flex;
    gap: 0.75rem;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
  @media (prefers-reduced-motion: reduce) {
    .card:hover {
      transform: none;
    }
  }
</style>
