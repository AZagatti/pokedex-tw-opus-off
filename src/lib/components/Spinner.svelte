<script lang="ts">
  interface Props {
    label?: string;
    size?: number;
  }
  let { label = "Loading", size = 28 }: Props = $props();
</script>

<div class="spinner-wrap" role="status">
  <span
    class="spinner"
    style="width: {size}px; height: {size}px;"
    aria-hidden="true"
  ></span>
  <span class="sr-only">{label}…</span>
</div>

<style>
  .spinner-wrap {
    display: grid;
    place-items: center;
    padding: 1rem;
  }
  .spinner {
    border-radius: 50%;
    border: 3px solid var(--bg-subtle);
    border-top-color: var(--accent);
    animation: spin 0.7s linear infinite;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 1.6s;
    }
  }
</style>
