import { idFromUrl } from "./api/client";
import type { EvolutionLink, NamedResource, Pokemon } from "./api/schemas";
import { baseStatTotal } from "./format";

/** A lightweight national-dex entry (name + id), derived from the list API. */
export interface DexEntry {
  name: string;
  id: number;
}

export type SortMode = "dex" | "stat";

export interface Filters {
  query: string;
  generation: number | null;
  types: string[];
}

/** Build sortable dex entries from the raw `/pokemon` list results. */
export function toDexEntries(results: NamedResource[]): DexEntry[] {
  return results
    .map((r) => ({ name: r.name, id: idFromUrl(r.url) }))
    .filter((e) => Number.isFinite(e.id));
}

/** Case-insensitive substring match against a Pokémon's display name. */
export function matchesSearch(name: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return name.toLowerCase().includes(q);
}

/**
 * Narrow the full dex to entries matching all active filters. `genNames` and
 * `typeNameSets` are pre-fetched name sets; when a filter is inactive its
 * argument is `null` and the constraint is skipped.
 *
 * Multiple selected types are combined with AND (a Pokémon must have every
 * selected type), which surfaces specific dual-type combinations.
 */
export function filterEntries(
  entries: DexEntry[],
  filters: Filters,
  genNames: Set<string> | null,
  typeNameSets: Set<string>[]
): DexEntry[] {
  return entries.filter((entry) => {
    if (!matchesSearch(entry.name, filters.query)) {
      return false;
    }
    if (genNames && !genNames.has(entry.name)) {
      return false;
    }
    for (const typeSet of typeNameSets) {
      if (!typeSet.has(entry.name)) {
        return false;
      }
    }
    return true;
  });
}

/** Sort loaded Pokémon detail objects by the chosen mode. */
export function sortPokemon(list: Pokemon[], mode: SortMode): Pokemon[] {
  if (mode === "stat") {
    return list.toSorted((a, b) => baseStatTotal(b) - baseStatTotal(a));
  }
  return list.toSorted((a, b) => a.id - b.id);
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.generation !== null ||
    filters.types.length > 0
  );
}

export interface EvolutionStageEntry {
  name: string;
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
}

/**
 * Flatten an evolution chain into breadth-first stages. Each stage is the set
 * of species at that evolution depth, so linear chains render as columns and
 * branching chains (e.g. Eevee) show all options side by side.
 */
export function evolutionStages(root: EvolutionLink): EvolutionStageEntry[][] {
  const stages: EvolutionStageEntry[][] = [];
  let current: EvolutionLink[] = [root];
  while (current.length > 0) {
    stages.push(
      current.map((link) => {
        const [detail] = link.evolution_details;
        return {
          name: link.species.name,
          minLevel: detail?.min_level ?? null,
          trigger: detail?.trigger?.name ?? null,
          item: detail?.item?.name ?? null,
        };
      })
    );
    current = current.flatMap((link) => link.evolves_to);
  }
  return stages;
}
