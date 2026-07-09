<div class="card-surface sk" aria-hidden="true">
  <div class="top">
    <span class="skeleton bar" style="width: 3rem;"></span>
    <span class="skeleton dot"></span>
  </div>
  <span class="skeleton art"></span>
  <span class="skeleton bar" style="width: 60%; height: 1rem;"></span>
  <div class="types">
    <span class="skeleton pillsk"></span>
    <span class="skeleton pillsk"></span>
  </div>
</div>

<style>
  .sk {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 0.85rem;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bar {
    height: 0.75rem;
    border-radius: 999px;
    display: block;
  }
  .dot {
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 999px;
  }
  .art {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 0.9rem;
    display: block;
    margin: 0.25rem 0;
  }
  .types {
    display: flex;
    gap: 0.3rem;
  }
  .pillsk {
    width: 3rem;
    height: 1.1rem;
    border-radius: 999px;
    display: block;
  }
</style>
