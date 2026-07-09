<div class="card-surface sk" aria-hidden="true">
  <div class="top">
    <span class="skeleton bar" style="width: 3rem;"></span>
    <span class="skeleton dot"></span>
  </div>
  <span class="skeleton art"></span>
  <span class="name">
    <span class="skeleton bar" style="width: 65%; height: 1rem;"></span>
  </span>
  <div class="types">
    <span class="skeleton pillsk"></span>
    <span class="skeleton pillsk"></span>
  </div>
</div>

<style>
  /* Mirrors PokemonCard's box model exactly so the skeleton→card swap causes
     no layout shift (padding, gap and each row's height must match). */
  .sk {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.85rem;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 40px;
  }
  .bar {
    height: 0.78rem;
    border-radius: 999px;
    display: block;
  }
  .dot {
    width: 40px;
    height: 40px;
    border-radius: 999px;
  }
  .art {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 0.9rem;
    display: block;
  }
  .name {
    min-height: 2.55rem;
    display: flex;
    align-items: flex-start;
  }
  .types {
    display: flex;
    gap: 0.3rem;
    min-height: 1.35rem;
  }
  .pillsk {
    width: 3rem;
    height: 1.1rem;
    border-radius: 999px;
    display: block;
  }
</style>
