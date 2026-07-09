<script lang="ts">
  import { Heart } from "@lucide/svelte";
  import { favorites } from "$lib/stores/favorites.svelte";

  interface Props {
    id: number;
    name: string;
    size?: number;
  }

  let { id, name, size = 20 }: Props = $props();

  const active = $derived(favorites.has(id));

  function onClick(event: MouseEvent) {
    // Stop the click from bubbling to a parent card link.
    event.preventDefault();
    event.stopPropagation();
    favorites.toggle(id);
  }
</script>

<button
  type="button"
  class="fav"
  class:active
  onclick={onClick}
  aria-pressed={active}
  aria-label={active
    ? `Remove ${name} from favorites`
    : `Add ${name} to favorites`}
  title={active ? "Remove from favorites" : "Add to favorites"}
>
  <Heart {size} fill={active ? "currentColor" : "none"} strokeWidth={2.2} />
</button>

<style>
  .fav {
    display: grid;
    place-items: center;
    padding: 0.4rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-elevated) 80%, transparent);
    color: var(--text-faint);
    border: 1px solid var(--border);
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition:
      color 0.18s ease,
      transform 0.18s var(--ease-spring),
      background 0.18s ease;
  }

  @media (hover: hover) {
    .fav:hover {
      color: var(--accent);
      transform: scale(1.12);
    }
  }

  .fav.active {
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
  }

  .fav.active :global(svg) {
    animation: pop 0.32s var(--ease-spring);
  }

  @keyframes pop {
    0% {
      transform: scale(0.6);
    }
    60% {
      transform: scale(1.25);
    }
    100% {
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fav,
    .fav:hover {
      transition: color 0.15s ease;
      transform: none;
    }
    .fav.active :global(svg) {
      animation: none;
    }
  }
</style>
