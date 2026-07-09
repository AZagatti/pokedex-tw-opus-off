<script lang="ts">
  import { ArrowLeft } from "@lucide/svelte";
  import { page } from "$app/state";
  import { berrySprite, getBerry } from "$lib/api/client";
  import type { Berry } from "$lib/api/schemas";
  import PokemonImage from "$lib/components/PokemonImage.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import { flavorColor } from "$lib/constants";
  import { dexNumber, titleCase } from "$lib/format";
  import { href } from "$lib/paths";

  const name = $derived(page.params.name ?? "");

  let berry = $state<Berry | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    const target = name;
    loading = true;
    error = null;
    berry = null;
    let cancelled = false;

    getBerry(target)
      .then((b) => {
        if (!cancelled) {
          berry = b;
          loading = false;
        }
      })
      .catch(() => {
        if (!cancelled) {
          error = `Couldn't find a berry called "${target}".`;
          loading = false;
        }
      });

    return () => {
      cancelled = true;
    };
  });

  const display = $derived(berry ? titleCase(berry.name) : titleCase(name));
  const maxPotency = 40;

  const facts = $derived(
    berry
      ? [
          { label: "Firmness", value: titleCase(berry.firmness.name) },
          { label: "Growth time", value: `${berry.growth_time} h / stage` },
          { label: "Max harvest", value: `${berry.max_harvest} berries` },
          { label: "Size", value: `${berry.size} mm` },
          { label: "Smoothness", value: `${berry.smoothness}` },
          { label: "Soil dryness", value: `${berry.soil_dryness}` },
          {
            label: "Natural gift",
            value: `${titleCase(berry.natural_gift_type.name)} · ${berry.natural_gift_power}`,
          },
        ]
      : [],
  );
</script>

<svelte:head>
  <title>{display} Berry — Pokédex</title>
  <meta
    name="description"
    content={`${display} Berry — firmness, flavors, growth time and size.`}
  />
</svelte:head>

<a class="back" href={href("/berries")} data-sveltekit-preload-data="hover">
  <ArrowLeft size={18} aria-hidden="true" /> Back to Berries
</a>

{#if error}
  <div class="error-box">
    <p>{error}</p>
    <a class="btn" href={href("/berries")}>Return to Berries</a>
  </div>
{:else if loading && !berry}
  <div class="loading"><Spinner label={`Loading ${display}`} size={36} /></div>
{:else if berry}
  <article class="detail">
    <section class="hero card-surface">
      <div class="hero-art">
        <PokemonImage
          src={berrySprite(berry.name)}
          alt={`${display} Berry`}
          size="140px"
          eager
        />
      </div>
      <div class="hero-info">
        <span class="dex tabular">{dexNumber(berry.id)}</span>
        <h1>{display} Berry</h1>
        <span class="firmness">{titleCase(berry.firmness.name)}</span>
      </div>
    </section>

    <div class="grid">
      <section class="panel card-surface">
        <h2>Flavors</h2>
        <div class="flavors">
          {#each berry.flavors as f (f.flavor.name)}
            <div class="flavor-row">
              <span class="flavor-name">{titleCase(f.flavor.name)}</span>
              <span class="flavor-val tabular">{f.potency}</span>
              <div class="track">
                <div
                  class="fill"
                  style="width: {Math.min(
                    100,
                    (f.potency / maxPotency) * 100,
                  )}%; background: {flavorColor(f.flavor.name)};"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <section class="panel card-surface">
        <h2>Facts</h2>
        <dl class="facts">
          {#each facts as fact (fact.label)}
            <div class="fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          {/each}
        </dl>
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
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    animation: rise 0.5s var(--ease-out-soft) both;
  }
  .hero-art :global(img) {
    image-rendering: pixelated;
  }
  .hero-info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .dex {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-muted);
  }
  .hero-info h1 {
    font-size: clamp(1.6rem, 5vw, 2.3rem);
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .firmness {
    align-self: flex-start;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: capitalize;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: var(--bg-subtle);
    color: var(--text-muted);
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

  .flavors {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .flavor-row {
    display: grid;
    grid-template-columns: 4rem 2rem 1fr;
    align-items: center;
    gap: 0.6rem;
  }
  .flavor-name {
    font-size: 0.82rem;
    font-weight: 600;
  }
  .flavor-val {
    font-size: 0.82rem;
    font-weight: 700;
    text-align: right;
  }
  .track {
    height: 8px;
    border-radius: 999px;
    background: var(--bg-subtle);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.9s var(--ease-out-soft);
  }

  .facts {
    display: grid;
    gap: 0.4rem;
  }
  .fact {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.55rem 0.7rem;
    background: var(--bg-subtle);
    border-radius: 0.6rem;
  }
  .fact dt {
    color: var(--text-muted);
    font-size: 0.85rem;
  }
  .fact dd {
    font-weight: 700;
    font-size: 0.9rem;
    text-align: right;
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
  @media (prefers-reduced-motion: reduce) {
    .hero,
    .panel {
      animation: none;
    }
    .fill {
      transition: none;
    }
  }
</style>
