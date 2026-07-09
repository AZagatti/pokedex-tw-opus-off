<script lang="ts">
  import { MAX_BASE_STAT, STAT_META } from "$lib/constants";

  interface Props {
    name: string;
    value: number;
    /** Staggered entrance delay (ms). */
    delay?: number;
  }

  let { name, value, delay = 0 }: Props = $props();

  const meta = $derived(
    STAT_META[name] ?? { label: name, short: name.slice(0, 3).toUpperCase() },
  );
  const pct = $derived(Math.min(100, (value / MAX_BASE_STAT) * 100));

  // Animate from 0 → pct once mounted.
  let mounted = $state(false);
  $effect(() => {
    const id = requestAnimationFrame(() => (mounted = true));
    return () => cancelAnimationFrame(id);
  });

  // Color ramp: red (low) → amber → green (high).
  const hue = $derived(Math.round((value / 180) * 120));
</script>

<div class="row">
  <span class="label" title={meta.label}>{meta.short}</span>
  <span class="value tabular">{value}</span>
  <div class="track">
    <div
      class="fill"
      style="width: {mounted
        ? pct
        : 0}%; transition-delay: {delay}ms; background: linear-gradient(90deg, hsl({hue} 70% 45%), hsl({hue} 75% 55%));"
    ></div>
  </div>
</div>

<style>
  .row {
    display: grid;
    grid-template-columns: 2.6rem 2.2rem 1fr;
    align-items: center;
    gap: 0.6rem;
  }

  .label {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 0.03em;
  }

  .value {
    font-size: 0.82rem;
    font-weight: 600;
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

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition: none;
    }
  }
</style>
