import { cachedFetch } from "./cache";
import type { FetchOptions } from "./cache";
import {
  berrySchema,
  evolutionChainSchema,
  generationSchema,
  pokemonSchema,
  resourceListSchema,
  speciesSchema,
  typeSchema,
} from "./schemas";
import type {
  Berry,
  EvolutionChain,
  Generation,
  Pokemon,
  ResourceList,
  Species,
  TypeResource,
} from "./schemas";

export const API_BASE = "https://pokeapi.co/api/v2";

/** Extract the trailing numeric id from a PokeAPI resource url. */
export function idFromUrl(url: string): number {
  const match = url.match(/\/(?<id>\d+)\/?$/u);
  return match?.groups ? Number(match.groups.id) : Number.NaN;
}

/**
 * PokeAPI serves sprites from raw.githubusercontent.com, which rate-limits
 * (HTTP 429) under bursty grid loads. Rewrite those URLs to the jsDelivr CDN
 * mirror of the same repo — a real CDN with no throttling and faster delivery.
 */
export function toCdn(url: string | null | undefined): string {
  if (!url) {
    return "";
  }
  return url.replace(
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/",
    "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/"
  );
}

/** Deterministic official-artwork URL from a dex id (no fetch required). */
export function officialArtwork(id: number): string {
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function listPokemon(
  limit: number,
  offset: number,
  options?: FetchOptions
): Promise<ResourceList> {
  return cachedFetch(
    `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
    (d) => resourceListSchema.parse(d),
    options
  );
}

export function getPokemon(
  nameOrId: string | number,
  options?: FetchOptions
): Promise<Pokemon> {
  return cachedFetch(
    `${API_BASE}/pokemon/${nameOrId}`,
    (d) => pokemonSchema.parse(d),
    options
  );
}

export function getSpecies(
  nameOrId: string | number,
  options?: FetchOptions
): Promise<Species> {
  return cachedFetch(
    `${API_BASE}/pokemon-species/${nameOrId}`,
    (d) => speciesSchema.parse(d),
    options
  );
}

export function getEvolutionChain(
  url: string,
  options?: FetchOptions
): Promise<EvolutionChain> {
  return cachedFetch(url, (d) => evolutionChainSchema.parse(d), options);
}

export function getType(
  name: string,
  options?: FetchOptions
): Promise<TypeResource> {
  return cachedFetch(
    `${API_BASE}/type/${name}`,
    (d) => typeSchema.parse(d),
    options
  );
}

export function getGeneration(
  id: number,
  options?: FetchOptions
): Promise<Generation> {
  return cachedFetch(
    `${API_BASE}/generation/${id}`,
    (d) => generationSchema.parse(d),
    options
  );
}

export function listBerries(
  limit: number,
  offset: number,
  options?: FetchOptions
): Promise<ResourceList> {
  return cachedFetch(
    `${API_BASE}/berry?limit=${limit}&offset=${offset}`,
    (d) => resourceListSchema.parse(d),
    options
  );
}

export function getBerry(
  nameOrId: string | number,
  options?: FetchOptions
): Promise<Berry> {
  return cachedFetch(
    `${API_BASE}/berry/${nameOrId}`,
    (d) => berrySchema.parse(d),
    options
  );
}
