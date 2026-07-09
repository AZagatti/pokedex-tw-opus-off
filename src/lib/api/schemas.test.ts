import { describe, expect, it } from "vitest";

import {
  berrySchema,
  pokemonSchema,
  resourceListSchema,
  typeSchema,
} from "./schemas";

describe("schemas", () => {
  it("parses a resource list envelope", () => {
    const parsed = resourceListSchema.parse({
      count: 2,
      next: null,
      previous: null,
      results: [{ name: "bulbasaur", url: "u" }],
    });
    expect(parsed.results[0].name).toBe("bulbasaur");
  });

  it("parses a pokemon and strips unknown keys", () => {
    const parsed = pokemonSchema.parse({
      id: 1,
      name: "bulbasaur",
      height: 7,
      weight: 69,
      sprites: { front_default: "u" },
      types: [{ slot: 1, type: { name: "grass", url: "u" } }],
      stats: [{ base_stat: 45, effort: 0, stat: { name: "hp", url: "u" } }],
      abilities: [
        { ability: { name: "overgrow", url: "u" }, is_hidden: false, slot: 1 },
      ],
      moves: [{ move: { name: "tackle", url: "u" } }],
      species: { name: "bulbasaur", url: "u" },
      __unknown: "dropped",
    });
    expect(parsed.name).toBe("bulbasaur");
    expect((parsed as Record<string, unknown>).__unknown).toBeUndefined();
  });

  it("rejects a malformed pokemon", () => {
    expect(() => pokemonSchema.parse({ id: "nope" })).toThrow();
  });

  it("parses a berry", () => {
    const parsed = berrySchema.parse({
      id: 1,
      name: "cheri",
      growth_time: 3,
      max_harvest: 5,
      natural_gift_power: 60,
      size: 20,
      smoothness: 25,
      soil_dryness: 15,
      firmness: { name: "soft", url: "u" },
      flavors: [{ potency: 10, flavor: { name: "spicy", url: "u" } }],
      natural_gift_type: { name: "fire", url: "u" },
    });
    expect(parsed.firmness.name).toBe("soft");
    expect(parsed.flavors[0].potency).toBe(10);
  });

  it("parses a type resource", () => {
    const parsed = typeSchema.parse({
      id: 10,
      name: "fire",
      pokemon: [{ slot: 1, pokemon: { name: "charmander", url: "u" } }],
    });
    expect(parsed.pokemon[0].pokemon.name).toBe("charmander");
  });
});
