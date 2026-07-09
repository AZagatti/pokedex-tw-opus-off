<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "$lib/components/Header.svelte";
  import { theme } from "$lib/stores/theme.svelte";

  let { children } = $props();

  // Keep <html data-theme> + localStorage in sync with the theme store.
  $effect(() => {
    theme.persist();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Pokédex — SvelteKit + PokeAPI</title>
</svelte:head>

<div class="app-shell">
  <Header />
  <main>
    {@render children()}
  </main>
  <footer>
    <div class="foot-inner">
      <span>
        Data from
        <a href="https://pokeapi.co" target="_blank" rel="noreferrer noopener"
          >PokeAPI</a
        >. Built with SvelteKit.
      </span>
      <a
        class="gh"
        href="https://github.com/AZagatti/pokedex-tw-opus-off"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="View source on GitHub"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
          />
        </svg>
        Source
      </a>
    </div>
  </footer>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  main {
    flex: 1;
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: 1.25rem 1rem 3rem;
  }

  footer {
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    font-size: 0.82rem;
    color: var(--text-muted);
  }
  .foot-inner {
    max-width: 72rem;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: space-between;
    align-items: center;
  }
  footer a {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .gh {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    text-decoration: none;
    font-weight: 600;
  }
</style>
