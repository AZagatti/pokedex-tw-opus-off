import { officialArtwork } from "./api/client";
import type { Pokemon } from "./api/schemas";

/** "1" -> "#0001" */
export function dexNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

/** "bulbasaur" -> "Bulbasaur"; "mr-mime" -> "Mr Mime" */
export function titleCase(name: string): string {
  return name
    .split(/[-\s]/u)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** PokeAPI height is in decimetres. */
export function formatHeight(height: number): string {
  return `${(height / 10).toFixed(1)} m`;
}

/** PokeAPI weight is in hectograms. */
export function formatWeight(weight: number): string {
  return `${(weight / 10).toFixed(1)} kg`;
}

export function baseStatTotal(pokemon: Pokemon): number {
  return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
}

/** Best available still image for a Pokémon, preferring official artwork. */
export function bestSprite(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default ??
    officialArtwork(pokemon.id)
  );
}

export interface SpriteVariant {
  key: string;
  label: string;
  url: string;
}

/** Ordered list of available front/back/shiny sprites for the detail switcher. */
export function spriteVariants(pokemon: Pokemon): SpriteVariant[] {
  const candidates: SpriteVariant[] = [
    {
      key: "official",
      label: "Artwork",
      url: pokemon.sprites.other?.["official-artwork"]?.front_default ?? "",
    },
    { key: "front", label: "Front", url: pokemon.sprites.front_default ?? "" },
    { key: "back", label: "Back", url: pokemon.sprites.back_default ?? "" },
    {
      key: "shiny",
      label: "Shiny",
      url: pokemon.sprites.front_shiny ?? "",
    },
    {
      key: "shiny-back",
      label: "Shiny back",
      url: pokemon.sprites.back_shiny ?? "",
    },
  ];
  return candidates.filter((c) => c.url.length > 0);
}

/** Pick the English flavour text, cleaned of the API's control characters. */
export function cleanFlavorText(text: string): string {
  return text
    .replaceAll(/[\n\f\r]/gu, " ")
    .replaceAll(/\s+/gu, " ")
    .trim();
}
