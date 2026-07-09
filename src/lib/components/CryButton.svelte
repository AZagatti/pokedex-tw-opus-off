<script lang="ts">
  import { Volume2 } from "@lucide/svelte";

  interface Props {
    cry: string | null | undefined;
    name: string;
  }

  let { cry, name }: Props = $props();

  let playing = $state(false);
  let audio: HTMLAudioElement | null = null;

  function play() {
    if (!cry) {
      return;
    }
    if (!audio) {
      audio = new Audio(cry);
      audio.volume = 0.4;
      audio.addEventListener("ended", () => {
        playing = false;
      });
    }
    audio.currentTime = 0;
    playing = true;
    audio.play().catch(() => {
      playing = false;
    });
  }

  // Stop playback if the component is torn down mid-cry.
  $effect(() => () => audio?.pause());
</script>

<button
  type="button"
  class="cry"
  class:playing
  onclick={play}
  disabled={!cry}
  aria-label={cry ? `Play ${name}'s cry` : "Cry unavailable"}
  title={cry ? "Play cry" : "Cry unavailable"}
>
  <Volume2 size={18} aria-hidden="true" />
  <span>Cry</span>
</button>

<style>
  .cry {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.9rem;
    border-radius: 0.7rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      background 0.15s ease,
      transform 0.12s var(--ease-spring);
  }
  .cry:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (hover: hover) {
    .cry:not(:disabled):hover {
      background: var(--bg-subtle);
    }
  }
  .cry.playing :global(svg) {
    animation: pulse 0.6s ease infinite;
    color: var(--accent);
  }
  @keyframes pulse {
    50% {
      transform: scale(1.18);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cry.playing :global(svg) {
      animation: none;
    }
  }
</style>
