import { browser } from "$app/environment";

export type Theme = "light" | "dark";

const STORAGE_KEY = "pokedex:theme";

function initialTheme(): Theme {
  if (!browser) {
    return "light";
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Theme store (Svelte 5 rune singleton). The DOM `data-theme` attribute and
 * localStorage are synced from the root layout's `$effect`.
 */
class ThemeStore {
  current = $state<Theme>(initialTheme());

  toggle(): void {
    this.current = this.current === "dark" ? "light" : "dark";
  }

  set(theme: Theme): void {
    this.current = theme;
  }

  /** Persist + reflect onto <html>. Call from an effect in the root layout. */
  persist(): void {
    if (!browser) {
      return;
    }
    document.documentElement.dataset.theme = this.current;
    localStorage.setItem(STORAGE_KEY, this.current);
  }
}

export const theme = new ThemeStore();
