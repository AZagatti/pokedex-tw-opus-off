import { browser } from "$app/environment";

const STORAGE_KEY = "pokedex:favorites";

function initialFavorites(): number[] {
  if (!browser) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is number => typeof v === "number");
    }
  } catch {
    // Corrupt storage — start fresh.
  }
  return [];
}

/**
 * Favorite Pokémon store — a set of national-dex ids, persisted to
 * localStorage. Detail data is refetched (from cache) where needed.
 */
class FavoritesStore {
  ids = $state<number[]>(initialFavorites());

  has(id: number): boolean {
    return this.ids.includes(id);
  }

  get count(): number {
    return this.ids.length;
  }

  toggle(id: number): void {
    this.ids = this.has(id)
      ? this.ids.filter((v) => v !== id)
      : [...this.ids, id];
    this.#persist();
  }

  remove(id: number): void {
    this.ids = this.ids.filter((v) => v !== id);
    this.#persist();
  }

  clear(): void {
    this.ids = [];
    this.#persist();
  }

  #persist(): void {
    if (!browser) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids));
  }
}

export const favorites = new FavoritesStore();
