/** The 18 Pokémon elemental types, in canonical order. */
export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

/** Canonical brand color (hex) for each type. */
export const TYPE_COLORS: Record<string, string> = {
  normal: "#a8a77a",
  fire: "#ee8130",
  water: "#6390f0",
  electric: "#f7d02c",
  grass: "#7ac74c",
  ice: "#96d9d6",
  fighting: "#c22e28",
  poison: "#a33ea1",
  ground: "#e2bf65",
  flying: "#a98ff3",
  psychic: "#f95587",
  bug: "#a6b91a",
  rock: "#b6a136",
  ghost: "#735797",
  dragon: "#6f35fc",
  dark: "#705746",
  steel: "#b7b7ce",
  fairy: "#d685ad",
};

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#8a8f9e";
}

/** WCAG relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => {
    const c = Number.parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * Pick near-black or white text for a type badge so it meets WCAG AA contrast —
 * white text on light types (electric, ice, ground) otherwise fails.
 */
export function readableTextOn(type: string): string {
  const hex = TYPE_COLORS[type];
  if (!hex) {
    return "#ffffff";
  }
  return luminance(hex) > 0.2 ? "#17181f" : "#ffffff";
}

export interface GenerationMeta {
  id: number;
  label: string;
  region: string;
}

export const GENERATIONS: GenerationMeta[] = [
  { id: 1, label: "Gen I", region: "Kanto" },
  { id: 2, label: "Gen II", region: "Johto" },
  { id: 3, label: "Gen III", region: "Hoenn" },
  { id: 4, label: "Gen IV", region: "Sinnoh" },
  { id: 5, label: "Gen V", region: "Unova" },
  { id: 6, label: "Gen VI", region: "Kalos" },
  { id: 7, label: "Gen VII", region: "Alola" },
  { id: 8, label: "Gen VIII", region: "Galar" },
  { id: 9, label: "Gen IX", region: "Paldea" },
];

/** Human-friendly labels + short codes for the six base stats. */
export const STAT_META: Record<string, { label: string; short: string }> = {
  hp: { label: "HP", short: "HP" },
  attack: { label: "Attack", short: "ATK" },
  defense: { label: "Defense", short: "DEF" },
  "special-attack": { label: "Sp. Atk", short: "SPA" },
  "special-defense": { label: "Sp. Def", short: "SPD" },
  speed: { label: "Speed", short: "SPE" },
};

/** Highest single base stat in the games — used to scale stat bars (0–1). */
export const MAX_BASE_STAT = 255;

/** Total number of Pokémon exposed by the national dex on PokeAPI. */
export const TOTAL_POKEMON = 1302;

export const PAGE_SIZE = 30;
