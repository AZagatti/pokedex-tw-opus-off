<script lang="ts">
  import { ChevronRight } from "@lucide/svelte";
  import { getPokemon } from "$lib/api/client";
  import type { EvolutionLink } from "$lib/api/schemas";
  import { bestSprite, titleCase } from "$lib/format";
  import { href } from "$lib/paths";
  import { evolutionStages } from "$lib/pokedex";
  import PokemonImage from "./PokemonImage.svelte";

  interface Props {
    root: EvolutionLink;
    currentName: string;
  }

  let { root, currentName }: Props = $props();

  const stages = $derived(evolutionStages(root));
  const sprites = $state<Record<string, string>>({});

  $effect(() => {
    for (const stage of stages) {
      for (const entry of stage) {
        if (sprites[entry.name]) {
          continue;
        }
        getPokemon(entry.name)
          .then((p) => {
            sprites[entry.name] = bestSprite(p);
          })
          .catch(() => {
            /* skip missing sprite */
          });
      }
    }
  });

  function edgeLabel(entry: {
    minLevel: number | null;
    trigger: string | null;
    item: string | null;
  }): string {
    if (entry.minLevel) {
      return `Lv. ${entry.minLevel}`;
    }
    if (entry.item) {
      return titleCase(entry.item);
    }
    if (entry.trigger) {
      return titleCase(entry.trigger);
    }
    return "";
  }
</script>

{#if stages.length <= 1}
  <p class="none">This Pokémon does not evolve.</p>
{:else}
  <div class="chain scroll-slim">
    {#each stages as stage, stageIndex (stageIndex)}
      {#if stageIndex > 0}
        <div class="edge" aria-hidden="true">
          <span class="edge-label">{edgeLabel(stage[0])}</span>
          <ChevronRight size={22} />
        </div>
      {/if}
      <div class="stage">
        {#each stage as entry (entry.name)}
          <a
            class="evo"
            class:current={entry.name === currentName}
            href={href(`/pokemon/${entry.name}`)}
            aria-current={entry.name === currentName ? "page" : undefined}
          >
            <div class="evo-img">
              <PokemonImage
                src={sprites[entry.name] ?? null}
                alt={titleCase(entry.name)}
                size="76px"
              />
            </div>
            <span class="evo-name">{titleCase(entry.name)}</span>
          </a>
        {/each}
      </div>
    {/each}
  </div>
{/if}

<style>
  .none {
    color: var(--text-muted);
    font-size: 0.92rem;
  }
  .chain {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  .stage {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .edge {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-faint);
    padding: 0 0.35rem;
  }
  .edge-label {
    font-size: 0.68rem;
    font-weight: 700;
    white-space: nowrap;
    color: var(--text-muted);
  }
  .evo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.5rem;
    border-radius: 0.9rem;
    text-decoration: none;
    color: var(--text);
    border: 1px solid transparent;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      transform 0.15s var(--ease-out-soft);
  }
  @media (hover: hover) {
    .evo:hover {
      background: var(--bg-subtle);
      transform: translateY(-2px);
    }
  }
  .evo.current {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
  .evo-img {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: var(--bg-subtle);
    display: grid;
    place-items: center;
  }
  .evo-name {
    font-size: 0.8rem;
    font-weight: 600;
  }
  @media (prefers-reduced-motion: reduce) {
    .evo:hover {
      transform: none;
    }
  }
</style>
