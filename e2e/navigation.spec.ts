import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("landing page loads correctly", async ({ page }) => {
    await page.goto("/");

    // Check main elements
    await expect(page.locator("h1")).toContainText("Free Tier List Maker");
    await expect(
      page.getByRole("link", { name: /get started/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /my tier lists/i })
    ).toBeVisible();
  });

  test("navigates from landing to tiers page", async ({ page }) => {
    await page.goto("/");

    // Click "Get Started" button
    await page.getByRole("link", { name: /get started/i }).click();

    // Should be on tiers page
    await expect(page).toHaveURL("/tiers");
  });

  test("navigates from landing to tiers via header link", async ({ page }) => {
    await page.goto("/");

    // Click "My Tier Lists" in header
    await page.getByRole("link", { name: /my tier lists/i }).click();

    await expect(page).toHaveURL("/tiers");
  });

  test("logo navigates to home", async ({ page }) => {
    await page.goto("/tiers");

    // Click logo/brand (LibreTier text in header)
    await page
      .getByRole("link", { name: /libretier/i })
      .first()
      .click();

    await expect(page).toHaveURL("/");
  });
});
