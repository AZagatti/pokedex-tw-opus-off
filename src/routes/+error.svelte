<script lang="ts">
  import { page } from "$app/state";
  import { href } from "$lib/paths";

  const status = $derived(page.status);
  const message = $derived(page.error?.message ?? "Something went wrong");
</script>

<svelte:head>
  <title>{status} — Pokédex</title>
</svelte:head>

<section class="error">
  <div class="ball" aria-hidden="true"></div>
  <p class="code tabular">{status}</p>
  <h1>{status === 404 ? "This Pokémon got away" : "Something went wrong"}</h1>
  <p class="msg">{message}</p>
  <a class="home-btn" href={href("/")}>Back to the Pokédex</a>
</section>

<style>
  .error {
    display: grid;
    place-items: center;
    text-align: center;
    gap: 0.5rem;
    padding: 4rem 1rem;
  }
  .ball {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: linear-gradient(#f04545 0 50%, #fff 50% 100%);
    border: 5px solid var(--text);
    position: relative;
    margin-bottom: 1rem;
    animation: wobble 2.4s var(--ease-out-soft) infinite;
  }
  .ball::after {
    content: "";
    position: absolute;
    inset: 45% 0 0;
    height: 5px;
    background: var(--text);
  }
  .code {
    font-size: 3rem;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  h1 {
    font-size: 1.4rem;
    font-weight: 700;
  }
  .msg {
    color: var(--text-muted);
    max-width: 28rem;
  }
  .home-btn {
    margin-top: 1rem;
    display: inline-block;
    padding: 0.65rem 1.4rem;
    border-radius: 0.8rem;
    background: var(--accent);
    color: var(--accent-contrast);
    font-weight: 700;
    text-decoration: none;
    box-shadow: var(--shadow-md);
    transition: transform 0.18s var(--ease-spring);
  }
  @media (hover: hover) {
    .home-btn:hover {
      transform: translateY(-2px);
    }
  }
  @keyframes wobble {
    0%,
    100% {
      transform: rotate(-6deg);
    }
    50% {
      transform: rotate(6deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ball {
      animation: none;
    }
    .home-btn:hover {
      transform: none;
    }
  }
</style>
