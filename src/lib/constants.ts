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

/** CSS custom property holding a type's brand color (defined in app.css @theme). */
export function typeColor(type: string): string {
  return `var(--color-poke-${type})`;
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
