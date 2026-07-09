<script lang="ts">
  import { page } from "$app/state";
  import { Cherry, Heart, Moon, Sparkles, Sun } from "@lucide/svelte";
  import { href } from "$lib/paths";
  import { favorites } from "$lib/stores/favorites.svelte";
  import { theme } from "$lib/stores/theme.svelte";

  const links = [
    { label: "Pokédex", path: "/", icon: Sparkles },
    { label: "Berries", path: "/berries", icon: Cherry },
    { label: "Favorites", path: "/favorites", icon: Heart },
  ];

  const current = $derived(page.url.pathname);

  function isActive(path: string): boolean {
    const full = href(path);
    if (path === "/") {
      return current === full || current === `${full}/` || current === href("");
    }
    return current.startsWith(full);
  }
</script>

<header class="site-header">
  <div class="inner">
    <a class="brand" href={href("/")} aria-label="Pokédex home">
      <span class="ball" aria-hidden="true"></span>
      <span class="brand-text">Poké<b>dex</b></span>
    </a>

    <nav aria-label="Primary">
      <ul>
        {#each links as link (link.path)}
          <li>
            <a
              href={href(link.path)}
              class="nav-link"
              class:active={isActive(link.path)}
              aria-current={isActive(link.path) ? "page" : undefined}
            >
              <link.icon size={17} aria-hidden="true" />
              <span class="nav-label">{link.label}</span>
              {#if link.path === "/favorites" && favorites.count > 0}
                <span class="count tabular">{favorites.count}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <button
      type="button"
      class="theme-toggle"
      onclick={() => theme.toggle()}
      aria-label="Toggle color theme"
      title="Toggle theme"
    >
      {#if theme.current === "dark"}
        <Sun size={18} aria-hidden="true" />
      {:else}
        <Moon size={18} aria-hidden="true" />
      {/if}
    </button>
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--bg) 72%, transparent);
    backdrop-filter: saturate(180%) blur(12px);
    border-bottom: 1px solid var(--border);
  }

  .inner {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
    color: var(--text);
    text-decoration: none;
  }
  .brand b {
    color: var(--accent);
    font-weight: 800;
  }

  .ball {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background:
      linear-gradient(#f04545 0 50%, #fff 50% 100%);
    border: 2px solid #14161f;
    position: relative;
    box-shadow: var(--shadow-sm);
  }
  .ball::after {
    content: "";
    position: absolute;
    inset: 45% 0 0;
    height: 2px;
    background: #14161f;
  }

  nav {
    margin-left: auto;
  }
  nav ul {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.7rem;
    color: var(--text-muted);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    position: relative;
    transition:
      color 0.15s ease,
      background 0.15s ease;
  }
  @media (hover: hover) {
    .nav-link:hover {
      color: var(--text);
      background: var(--bg-subtle);
    }
  }
  .nav-link.active {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .count {
    font-size: 0.68rem;
    font-weight: 700;
    background: var(--accent);
    color: var(--accent-contrast);
    border-radius: 999px;
    padding: 0.05rem 0.35rem;
    min-width: 1.1rem;
    text-align: center;
  }

  .theme-toggle {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 0.7rem;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--text);
    cursor: pointer;
    transition:
      background 0.15s ease,
      transform 0.15s var(--ease-spring);
  }
  @media (hover: hover) {
    .theme-toggle:hover {
      background: var(--bg-subtle);
      transform: rotate(-12deg);
    }
  }

  @media (max-width: 560px) {
    .nav-label {
      display: none;
    }
    .brand-text {
      display: none;
    }
    .nav-link {
      padding: 0.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-toggle:hover {
      transform: none;
    }
  }
</style>
