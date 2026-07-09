<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    description?: string;
    icon?: Snippet;
    action?: Snippet;
  }

  let { title, description, icon, action }: Props = $props();
</script>

<div class="empty">
  {#if icon}
    <div class="icon" aria-hidden="true">{@render icon()}</div>
  {/if}
  <h2>{title}</h2>
  {#if description}
    <p>{description}</p>
  {/if}
  {#if action}
    <div class="action">{@render action()}</div>
  {/if}
</div>

<style>
  .empty {
    display: grid;
    place-items: center;
    text-align: center;
    gap: 0.5rem;
    padding: 3.5rem 1rem;
    color: var(--text-muted);
  }
  .icon {
    color: var(--text-faint);
    margin-bottom: 0.5rem;
  }
  h2 {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text);
  }
  p {
    max-width: 26rem;
  }
  .action {
    margin-top: 0.75rem;
  }
</style>
