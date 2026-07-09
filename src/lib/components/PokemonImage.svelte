<script lang="ts">
  interface Props {
    src: string | null | undefined;
    alt: string;
    /** CSS size for the square image box (prevents layout shift). */
    size?: string;
    eager?: boolean;
    class?: string;
  }

  let {
    src,
    alt,
    size = "100%",
    eager = false,
    class: className = "",
  }: Props = $props();

  let loaded = $state(false);
  let failed = $state(false);

  // Reset state when the source changes (variant switcher, list recycling).
  $effect(() => {
    // reference src so the effect re-runs on change
    void src;
    loaded = false;
    failed = false;
  });
</script>

<div
  class="poke-img {className}"
  style="width: {size}; height: {size};"
  data-loaded={loaded}
>
  {#if !loaded && !failed}
    <div class="poke-img__skeleton skeleton" aria-hidden="true"></div>
  {/if}

  {#if src && !failed}
    <img
      {src}
      {alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable="false"
      onload={() => (loaded = true)}
      onerror={() => (failed = true)}
    />
  {:else if failed}
    <div class="poke-img__fallback" role="img" aria-label={alt}>
      <svg viewBox="0 0 24 24" width="42%" height="42%" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 0-9.95 9h6.09a4 4 0 0 1 7.72 0h6.09A10 10 0 0 0 12 2Zm0 20a10 10 0 0 0 9.95-9h-6.09a4 4 0 0 1-7.72 0H2.05A10 10 0 0 0 12 22Zm0-8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
        />
      </svg>
    </div>
  {/if}
</div>

<style>
  .poke-img {
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .poke-img__skeleton {
    position: absolute;
    inset: 8%;
    border-radius: 50%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0;
    transform: scale(0.9);
    transition:
      opacity 0.4s var(--ease-out-soft),
      transform 0.4s var(--ease-out-soft);
  }

  .poke-img[data-loaded="true"] img {
    opacity: 1;
    transform: scale(1);
  }

  .poke-img__fallback {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: var(--text-faint);
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: opacity 0.2s linear;
      transform: none;
    }
    .poke-img[data-loaded="true"] img {
      transform: none;
    }
  }
</style>
