import { beforeEach, describe, expect, it } from "vitest";

import { favorites } from "./favorites.svelte";

describe("favorites store", () => {
  beforeEach(() => {
    favorites.clear();
  });

  it("toggles ids on and off", () => {
    expect(favorites.has(25)).toBeFalsy();
    favorites.toggle(25);
    expect(favorites.has(25)).toBeTruthy();
    expect(favorites.count).toBe(1);
    favorites.toggle(25);
    expect(favorites.has(25)).toBeFalsy();
    expect(favorites.count).toBe(0);
  });

  it("removes a specific id", () => {
    favorites.toggle(1);
    favorites.toggle(4);
    favorites.remove(1);
    expect(favorites.has(1)).toBeFalsy();
    expect(favorites.has(4)).toBeTruthy();
  });

  it("clears all ids", () => {
    favorites.toggle(1);
    favorites.toggle(2);
    favorites.clear();
    expect(favorites.count).toBe(0);
  });
});
