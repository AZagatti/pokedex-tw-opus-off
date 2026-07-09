<script lang="ts">
  import { ArrowLeft, Ruler, Sparkles, Weight } from "@lucide/svelte";
  import { page } from "$app/state";
  import {
    getEvolutionChain,
    getPokemon,
    getSpecies,
  } from "$lib/api/client";
  import type {
    EvolutionChain,
    Pokemon,
    Species,
  } from "$lib/api/schemas";
  import CryButton from "$lib/components/CryButton.svelte";
  import EvolutionChainView from "$lib/components/EvolutionChain.svelte";
  import FavoriteButton from "$lib/components/FavoriteButton.svelte";
  import PokemonImage from "$lib/components/PokemonImage.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import StatBar from "$lib/components/StatBar.svelte";
  import TypeBadge from "$lib/components/TypeBadge.svelte";
  import { STAT_META, typeColor } from "$lib/constants";
  import {
    baseStatTotal,
    cleanFlavorText,
    dexNumber,
    formatHeight,
    formatWeight,
    spriteVariants,
    titleCase,
  } from "$lib/format";
  import { href } from "$lib/paths";

  const name = $derived(page.params.name ?? "");

  let pokemon = $state<Pokemon | null>(null);
  let species = $state<Species | null>(null);
  let evolution = $state<EvolutionChain | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let variantIndex = $state(0);

  $effect(() => {
    const target = name;
    loading = true;
    error = null;
    pokemon = null;
    species = null;
    evolution = null;
    variantIndex = 0;
    let cancelled = false;

    (async () => {
      try {
        const p = await getPokemon(target);
        if (cancelled) {
          return;
        }
        pokemon = p;
        loading = false;

        // Species + evolution are enrichment — failures here don't break the page.
        try {
          const s = await getSpecies(p.species.name);
          if (cancelled) {
            return;
          }
          species = s;
          if (s.evolution_chain?.url) {
            const chain = await getEvolutionChain(s.evolution_chain.url);
            if (!cancelled) {
              evolution = chain;
            }
          }
        } catch {
          /* enrichment is non-critical */
        }
      } catch {
        if (!cancelled) {
          error = `Couldn't find a Pokémon called "${target}".`;
          loading = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  });

  const display = $derived(pokemon ? titleCase(pokemon.name) : titleCase(name));
  const primaryType = $derived(pokemon?.types[0]?.type.name ?? "normal");
  const variants = $derived(pokemon ? spriteVariants(pokemon) : []);
  const currentVariant = $derived(variants[variantIndex] ?? variants[0]);
  const genus = $derived(
    species?.genera?.find((g) => g.language.name === "en")?.genus ?? "",
  );
  const flavor = $derived(
    cleanFlavorText(
      species?.flavor_text_entries?.find((f) => f.language.name === "en")
        ?.flavor_text ?? "",
    ),
  );
  const total = $derived(pokemon ? baseStatTotal(pokemon) : 0);
  const exampleMoves = $derived(pokemon ? pokemon.moves.slice(0, 12) : []);
</script>

<svelte:head>
  <title>{display} — Pokédex</title>
  <meta
    name="description"
    content={flavor || `${display} — stats, abilities, moves and evolutions.`}
  />
</svelte:head>

<a class="back" href={href("/")} data-sveltekit-preload-data="hover">
  <ArrowLeft size={18} aria-hidden="true" /> Back to Pokédex
</a>

{#if error}
  <div class="error-box">
    <p>{error}</p>
    <a class="btn" href={href("/")}>Return to the Pokédex</a>
  </div>
{:else if loading && !pokemon}
  <div class="loading">
    <Spinner label={`Loading ${display}`} size={36} />
  </div>
{:else if pokemon}
  <article
    class="detail"
    style="--type-color: {typeColor(primaryType)};"
  >
    <!-- Hero -->
    <section class="hero card-surface">
      <div class="hero-bg" aria-hidden="true"></div>

      <div class="hero-art">
        <div class="art-frame" class:pixel={currentVariant?.key !== "official"}>
          <PokemonImage
            src={currentVariant?.url ?? null}
            alt={`${display} ${currentVariant?.label ?? ""}`}
            size="min(320px, 72vw)"
            eager
          />
        </div>
        {#if variants.length > 1}
          <div class="variants" role="group" aria-label="Sprite variants">
            {#each variants as variant, i (variant.key)}
              <button
                type="button"
                class="variant"
                class:on={i === variantIndex}
                onclick={() => (variantIndex = i)}
                aria-pressed={i === variantIndex}
              >
                {variant.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="hero-info">
        <span class="dex tabular">{dexNumber(pokemon.id)}</span>
        <div class="title-row">
          <h1>{display}</h1>
          <FavoriteButton id={pokemon.id} name={display} size={22} />
        </div>
        {#if genus}<p class="genus">{genus}</p>{/if}

        <div class="types">
          {#each pokemon.types as t (t.type.name)}
            <TypeBadge type={t.type.name} />
          {/each}
        </div>

        {#if flavor}<p class="flavor">{flavor}</p>{/if}

        <div class="quick">
          <div class="quick-item">
            <Ruler size={16} aria-hidden="true" />
            <span class="q-label">Height</span>
            <span class="q-value tabular">{formatHeight(pokemon.height)}</span>
          </div>
          <div class="quick-item">
            <Weight size={16} aria-hidden="true" />
            <span class="q-label">Weight</span>
            <span class="q-value tabular">{formatWeight(pokemon.weight)}</span>
          </div>
          {#if pokemon.base_experience}
            <div class="quick-item">
              <Sparkles size={16} aria-hidden="true" />
              <span class="q-label">Base XP</span>
              <span class="q-value tabular">{pokemon.base_experience}</span>
            </div>
          {/if}
        </div>

        <CryButton cry={pokemon.cries?.latest} name={display} />
      </div>
    </section>

    <div class="grid">
      <!-- Stats -->
      <section class="panel card-surface">
        <h2>Base stats</h2>
        <div class="stats">
          {#each pokemon.stats as stat, i (stat.stat.name)}
            <StatBar name={stat.stat.name} value={stat.base_stat} delay={i * 70} />
          {/each}
          <div class="stat-total">
            <span>Total</span>
            <span class="tabular">{total}</span>
          </div>
        </div>
      </section>

      <!-- Abilities -->
      <section class="panel card-surface">
        <h2>Abilities</h2>
        <ul class="abilities">
          {#each pokemon.abilities as ability (ability.ability.name)}
            <li>
              <span class="ability-name">{titleCase(ability.ability.name)}</span>
              {#if ability.is_hidden}
                <span class="hidden-tag">Hidden</span>
              {/if}
            </li>
          {/each}
        </ul>

        <h2 class="moves-h">Example moves</h2>
        <div class="moves">
          {#each exampleMoves as m (m.move.name)}
            <span class="move-chip">{titleCase(m.move.name)}</span>
          {/each}
        </div>
      </section>

      <!-- Evolution -->
      <section class="panel card-surface evo-panel">
        <h2>Evolution</h2>
        {#if evolution}
          <EvolutionChainView
            root={evolution.chain}
            currentName={pokemon.species.name}
          />
        {:else}
          <div class="evo-loading"><Spinner size={22} /></div>
        {/if}
      </section>
    </div>
  </article>
{/if}

<style>
  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    margin-bottom: 1rem;
    transition: color 0.15s ease;
  }
  @media (hover: hover) {
    .back:hover {
      color: var(--text);
    }
  }

  .loading {
    padding: 5rem 0;
  }
  .error-box {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-muted);
  }
  .btn {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.6rem 1.3rem;
    border-radius: 0.7rem;
    background: var(--accent);
    color: var(--accent-contrast);
    font-weight: 700;
    text-decoration: none;
  }

  .detail {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: 1.5rem;
    padding: 1.5rem;
    overflow: hidden;
    isolation: isolate;
    animation: rise 0.5s var(--ease-out-soft) both;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(
      circle at 30% 0%,
      color-mix(in srgb, var(--type-color) 30%, transparent),
      transparent 60%
    );
  }

  .hero-art {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .art-frame {
    width: min(320px, 72vw);
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    filter: drop-shadow(0 12px 18px rgb(0 0 0 / 0.25));
    animation: float 5s var(--ease-out-soft) infinite;
  }
  .art-frame.pixel :global(img) {
    image-rendering: pixelated;
  }

  .variants {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    justify-content: center;
  }
  .variant {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--text-muted);
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }
  @media (hover: hover) {
    .variant:hover {
      color: var(--text);
      background: var(--bg-subtle);
    }
  }
  .variant.on {
    background: var(--type-color);
    color: #fff;
    border-color: var(--type-color);
  }

  .hero-info {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    justify-content: center;
  }
  .dex {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-muted);
  }
  .title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .title-row h1 {
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    font-weight: 800;
    letter-spacing: -0.03em;
  }
  .genus {
    color: var(--text-muted);
    font-weight: 600;
    margin-top: -0.4rem;
  }
  .types {
    display: flex;
    gap: 0.4rem;
    margin: 0.25rem 0;
  }
  .flavor {
    color: var(--text-muted);
    line-height: 1.55;
    max-width: 40ch;
  }

  .quick {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 0.5rem 0;
  }
  .quick-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.8rem;
    background: var(--bg-subtle);
    border-radius: 0.7rem;
    color: var(--text-muted);
  }
  .q-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .q-value {
    font-weight: 700;
    color: var(--text);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
  .panel {
    padding: 1.25rem;
    animation: rise 0.5s var(--ease-out-soft) both;
    animation-delay: 0.1s;
  }
  .panel h2 {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .moves-h {
    margin-top: 1.5rem;
  }
  .evo-panel {
    grid-column: 1 / -1;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .stat-total {
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    padding-top: 0.6rem;
    margin-top: 0.3rem;
    border-top: 1px solid var(--border);
  }

  .abilities {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .abilities li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.8rem;
    background: var(--bg-subtle);
    border-radius: 0.6rem;
    font-weight: 600;
  }
  .hidden-tag {
    font-size: 0.66rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--accent);
  }

  .moves {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .move-chip {
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.3rem 0.6rem;
    border-radius: 0.5rem;
    background: var(--bg-subtle);
    color: var(--text-muted);
  }

  .evo-loading {
    padding: 1rem 0;
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes float {
    50% {
      transform: translateY(-10px);
    }
  }

  @media (max-width: 720px) {
    .hero {
      grid-template-columns: 1fr;
      text-align: center;
    }
    .hero-info {
      align-items: center;
    }
    .title-row,
    .types,
    .quick {
      justify-content: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero,
    .panel,
    .art-frame {
      animation: none;
    }
  }
</style>
