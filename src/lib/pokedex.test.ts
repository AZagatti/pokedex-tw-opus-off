import { describe, expect, it } from "vitest";

import type { EvolutionLink, Pokemon } from "./api/schemas";
import {
  evolutionStages,
  filterEntries,
  hasActiveFilters,
  matchesSearch,
  sortPokemon,
  toDexEntries,
} from "./pokedex";

const entries = [
  { name: "bulbasaur", id: 1 },
  { name: "charmander", id: 4 },
  { name: "charizard", id: 6 },
  { name: "squirtle", id: 7 },
];

function statPokemon(id: number, name: string, total: number): Pokemon {
  return {
    id,
    name,
    stats: [{ base_stat: total, effort: 0, stat: { name: "hp", url: "" } }],
  } as Pokemon;
}

describe("toDexEntries", () => {
  it("extracts name + id from list results", () => {
    const result = toDexEntries([
      { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
      { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
    ]);
    expect(result).toStrictEqual([
      { name: "bulbasaur", id: 1 },
      { name: "ivysaur", id: 2 },
    ]);
  });
});

describe("matchesSearch", () => {
  it("is case-insensitive and matches empty query", () => {
    expect(matchesSearch("Charizard", "char")).toBeTruthy();
    expect(matchesSearch("Charizard", "ZARD")).toBeTruthy();
    expect(matchesSearch("Charizard", "")).toBeTruthy();
    expect(matchesSearch("Charizard", "pika")).toBeFalsy();
  });
});

describe("filterEntries", () => {
  const base = { query: "", generation: null, types: [] as string[] };

  it("filters by search", () => {
    const result = filterEntries(entries, { ...base, query: "char" }, null, []);
    expect(result.map((e) => e.name)).toStrictEqual([
      "charmander",
      "charizard",
    ]);
  });

  it("filters by generation name set", () => {
    const gen = new Set(["bulbasaur", "charmander"]);
    const result = filterEntries(entries, base, gen, []);
    expect(result.map((e) => e.name)).toStrictEqual([
      "bulbasaur",
      "charmander",
    ]);
  });

  it("intersects multiple type sets (AND)", () => {
    const fire = new Set(["charmander", "charizard"]);
    const flying = new Set(["charizard", "pidgey"]);
    const result = filterEntries(entries, base, null, [fire, flying]);
    expect(result.map((e) => e.name)).toStrictEqual(["charizard"]);
  });
});

describe("sortPokemon", () => {
  const list = [
    statPokemon(6, "charizard", 534),
    statPokemon(1, "bulbasaur", 318),
    statPokemon(4, "charmander", 309),
  ];

  it("sorts by dex id ascending", () => {
    expect(sortPokemon(list, "dex").map((p) => p.id)).toStrictEqual([1, 4, 6]);
  });

  it("sorts by base-stat total descending", () => {
    expect(sortPokemon(list, "stat").map((p) => p.id)).toStrictEqual([6, 1, 4]);
  });

  it("does not mutate the input", () => {
    const copy = [...list];
    sortPokemon(list, "stat");
    expect(list).toStrictEqual(copy);
  });
});

describe("hasActiveFilters", () => {
  it("detects any active filter", () => {
    expect(
      hasActiveFilters({ query: "", generation: null, types: [] })
    ).toBeFalsy();
    expect(
      hasActiveFilters({ query: "x", generation: null, types: [] })
    ).toBeTruthy();
    expect(
      hasActiveFilters({ query: "", generation: 1, types: [] })
    ).toBeTruthy();
    expect(
      hasActiveFilters({ query: "", generation: null, types: ["fire"] })
    ).toBeTruthy();
  });
});

describe("evolutionStages", () => {
  const chain: EvolutionLink = {
    species: { name: "charmander", url: "" },
    evolution_details: [],
    evolves_to: [
      {
        species: { name: "charmeleon", url: "" },
        evolution_details: [
          { min_level: 16, trigger: { name: "level-up", url: "" }, item: null },
        ],
        evolves_to: [
          {
            species: { name: "charizard", url: "" },
            evolution_details: [
              {
                min_level: 36,
                trigger: { name: "level-up", url: "" },
                item: null,
              },
            ],
            evolves_to: [],
          },
        ],
      },
    ],
  };

  it("flattens a linear chain into ordered stages", () => {
    const stages = evolutionStages(chain);
    expect(stages).toHaveLength(3);
    expect(stages[0][0].name).toBe("charmander");
    expect(stages[1][0].name).toBe("charmeleon");
    expect(stages[1][0].minLevel).toBe(16);
    expect(stages[2][0].name).toBe("charizard");
  });

  it("groups branching evolutions into one stage", () => {
    const eevee: EvolutionLink = {
      species: { name: "eevee", url: "" },
      evolution_details: [],
      evolves_to: [
        {
          species: { name: "vaporeon", url: "" },
          evolution_details: [],
          evolves_to: [],
        },
        {
          species: { name: "jolteon", url: "" },
          evolution_details: [],
          evolves_to: [],
        },
      ],
    };
    const stages = evolutionStages(eevee);
    expect(stages[1].map((s) => s.name)).toStrictEqual(["vaporeon", "jolteon"]);
  });
});
