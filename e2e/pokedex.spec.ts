import { expect, test } from "@playwright/test";

test.describe("Pokédex list", () => {
  test("loads the grid with cards", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Pokédex", level: 1 })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Bulbasaur/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Charizard/ })).toBeVisible();
  });

  test("search filters the list", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Bulbasaur/ })).toBeVisible();

    await page.getByRole("searchbox", { name: /search pokémon/i }).fill("char");

    await expect(page.getByRole("link", { name: /Charizard/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Bulbasaur/ })).toHaveCount(0);
  });

  test("filters by generation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: /generation/i }).selectOption("1");
    // Kanto starter present, a later-gen Pokémon absent.
    await expect(page.getByRole("link", { name: /Bulbasaur/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Chikorita/ })).toHaveCount(0);
  });
});

test.describe("detail page", () => {
  test("opens a Pokémon detail with stats and evolution", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Bulbasaur/ })
      .first()
      .click();

    await expect(page).toHaveURL(/\/pokemon\/bulbasaur/);
    await expect(
      page.getByRole("heading", { name: "Bulbasaur", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Base stats" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Abilities" })
    ).toBeVisible();
    // Evolution chain links to the next stage.
    await expect(page.getByRole("link", { name: /Ivysaur/ })).toBeVisible();
  });
});

test.describe("favorites", () => {
  test("favoriting persists to the favorites page and across reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: /add bulbasaur to favorites/i })
      .click();

    await page
      .getByRole("link", { name: "Favorites", exact: false })
      .first()
      .click();
    await expect(page).toHaveURL(/\/favorites/);
    await expect(page.getByRole("link", { name: /Bulbasaur/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("link", { name: /Bulbasaur/ })).toBeVisible();
  });
});

test.describe("theme", () => {
  test("toggles and persists the theme", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const initial = await html.getAttribute("data-theme");

    await page.getByRole("button", { name: /toggle color theme/i }).click();
    await expect(html).not.toHaveAttribute("data-theme", initial ?? "light");

    const toggled = await html.getAttribute("data-theme");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", toggled ?? "dark");
  });
});

test.describe("berries", () => {
  test("lists berries and opens a berry detail", async ({ page }) => {
    await page.goto("/berries");
    await expect(
      page.getByRole("heading", { name: "Berries", level: 1 })
    ).toBeVisible();
    await page.getByRole("link", { name: /Cheri/ }).first().click();
    await expect(page).toHaveURL(/\/berries\/cheri/);
    await expect(
      page.getByRole("heading", { name: /Cheri Berry/ })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Flavors" })).toBeVisible();
  });
});
