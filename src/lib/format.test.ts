import { describe, expect, it } from "vitest";

import type { Pokemon } from "./api/schemas";
import {
  baseStatTotal,
  bestSprite,
  cleanFlavorText,
  dexNumber,
  formatHeight,
  formatWeight,
  spriteVariants,
  titleCase,
} from "./format";

function makePokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    id: 25,
    name: "pikachu",
    height: 4,
    weight: 60,
    sprites: {
      front_default:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
      back_default: null,
      front_shiny: null,
      back_shiny: null,
      other: {
        "official-artwork": {
          front_default:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
        },
      },
    },
    types: [{ slot: 1, type: { name: "electric", url: "" } }],
    stats: [
      { base_stat: 35, effort: 0, stat: { name: "hp", url: "" } },
      { base_stat: 55, effort: 0, stat: { name: "attack", url: "" } },
    ],
    abilities: [],
    moves: [],
    species: { name: "pikachu", url: "" },
    ...overrides,
  } as Pokemon;
}

describe("format", () => {
  it("pads dex numbers to four digits", () => {
    expect(dexNumber(1)).toBe("#0001");
    expect(dexNumber(1302)).toBe("#1302");
  });

  it("title-cases hyphenated names", () => {
    expect(titleCase("bulbasaur")).toBe("Bulbasaur");
    expect(titleCase("mr-mime")).toBe("Mr Mime");
    expect(titleCase("nidoran-f")).toBe("Nidoran F");
  });

  it("converts height (dm) and weight (hg)", () => {
    expect(formatHeight(4)).toBe("0.4 m");
    expect(formatWeight(60)).toBe("6.0 kg");
  });

  it("sums base stats", () => {
    expect(baseStatTotal(makePokemon())).toBe(90);
  });

  it("rewrites the best sprite to the jsDelivr CDN", () => {
    expect(bestSprite(makePokemon())).toContain("cdn.jsdelivr.net");
    expect(bestSprite(makePokemon())).not.toContain("raw.githubusercontent");
  });

  it("falls back to generated artwork when no sprites exist", () => {
    const p = makePokemon({
      sprites: {
        front_default: null,
        back_default: null,
        front_shiny: null,
        back_shiny: null,
      },
    } as Partial<Pokemon>);
    expect(bestSprite(p)).toContain("official-artwork/25.png");
  });

  it("lists only available sprite variants (CDN)", () => {
    const variants = spriteVariants(makePokemon());
    expect(variants.map((v) => v.key)).toContain("official");
    expect(variants.map((v) => v.key)).toContain("front");
    expect(
      variants.every((v) => v.url.includes("cdn.jsdelivr.net"))
    ).toBeTruthy();
  });

  it("cleans flavor text control characters", () => {
    expect(cleanFlavorText("Line one\fline\ntwo   spaced")).toBe(
      "Line one line two spaced"
    );
  });
});
