import { describe, expect, it } from "vitest";

import {
  flavorColor,
  GENERATIONS,
  POKEMON_TYPES,
  readableTextOn,
  typeColor,
} from "./constants";

describe("constants", () => {
  it("exposes 18 types and 9 generations", () => {
    expect(POKEMON_TYPES).toHaveLength(18);
    expect(GENERATIONS).toHaveLength(9);
  });

  it("returns a hex color per type and a fallback", () => {
    expect(typeColor("fire")).toBe("#ee8130");
    expect(typeColor("unknown")).toBe("#8a8f9e");
  });

  it("picks dark text on light type colors, white on dark ones", () => {
    // Light types → dark text.
    expect(readableTextOn("electric")).toBe("#17181f");
    expect(readableTextOn("ice")).toBe("#17181f");
    expect(readableTextOn("ground")).toBe("#17181f");
    // Dark types → white text.
    expect(readableTextOn("dragon")).toBe("#ffffff");
    expect(readableTextOn("ghost")).toBe("#ffffff");
    expect(readableTextOn("dark")).toBe("#ffffff");
  });

  it("maps berry flavors to colors", () => {
    expect(flavorColor("spicy")).toBe("#e0484b");
    expect(flavorColor("mystery")).toBe("#8a8f9e");
  });
});
