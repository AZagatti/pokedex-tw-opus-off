import { base } from "$app/paths";

/** Prefix an internal path with the configured base (GitHub Pages subpath). */
export function href(path: string): string {
  return `${base}${path}`;
}
