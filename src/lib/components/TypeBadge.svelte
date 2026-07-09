<script lang="ts">
  import { typeColor } from "$lib/constants";

  interface Props {
    type: string;
    size?: "sm" | "md";
  }

  let { type, size = "md" }: Props = $props();
</script>

<span
  class="pill type-badge"
  class:sm={size === "sm"}
  style="background: linear-gradient(135deg, {typeColor(
    type,
  )}, color-mix(in srgb, {typeColor(type)} 78%, black));"
>
  {type}
</span>

<style>
  .type-badge {
    box-shadow: var(--shadow-sm);
  }
  .type-badge.sm {
    font-size: 0.62rem;
    padding: 0.1rem 0.45rem;
  }
</style>
