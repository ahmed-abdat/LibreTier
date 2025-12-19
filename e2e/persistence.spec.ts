import { test, expect } from "@playwright/test";

test.describe("LocalStorage Persistence", () => {
  test("tier list persists after page reload", async ({ page }) => {
    // Clear localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // Create a tier list
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Edit title
    const titleInput = page.getByPlaceholder("Tier List Title");
    await titleInput.fill("Persistent List");

    // Wait for save (debounce)
    await page.waitForTimeout(500);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);

    // Title should still be there
    await expect(page.getByPlaceholder("Tier List Title")).toHaveValue(
      "Persistent List"
    );
  });

  test("tier list persists in gallery after reload", async ({ page }) => {
    // Clear localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // Create a tier list
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    await page.getByPlaceholder("Tier List Title").fill("Gallery Test");
    await page.waitForTimeout(500);

    // Go to gallery
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Verify it's there
    await expect(page.getByText("Gallery Test")).toBeVisible();

    // Reload
    await page.reload();
    await page.waitForTimeout(1000);

    // Still there after reload
    await expect(page.getByText("Gallery Test")).toBeVisible();
  });

  test("multiple tier lists persist correctly", async ({ page }) => {
    // Clear localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // Create first tier list
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    let getStartedBtn = page.getByRole("button", { name: /get started/i });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
    await page.getByPlaceholder("Tier List Title").fill("First List");

    // Create second tier list
    await page.goto("/tiers");
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /create new/i }).click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
    await page.getByPlaceholder("Tier List Title").fill("Second List");

    // Create third tier list
    await page.goto("/tiers");
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /create new/i }).click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
    await page.getByPlaceholder("Tier List Title").fill("Third List");

    // Go to gallery and reload
    await page.goto("/tiers");
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForTimeout(1000);

    // All three should be visible
    await expect(page.getByText("First List")).toBeVisible();
    await expect(page.getByText("Second List")).toBeVisible();
    await expect(page.getByText("Third List")).toBeVisible();
    await expect(page.getByText(/you have 3 tier lists/i)).toBeVisible();
  });

  test("deleted tier list does not persist", async ({ page }) => {
    // Clear localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // Create a tier list
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
    await page.getByPlaceholder("Tier List Title").fill("To Delete");

    // Go to gallery
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Delete it
    const card = page.getByText("To Delete");
    await card.hover();
    const menuTrigger = page
      .locator(".group")
      .filter({ hasText: "To Delete" })
      .getByRole("button")
      .first();
    await menuTrigger.click();
    await page.getByRole("menuitem", { name: /delete/i }).click();
    await page
      .getByRole("button", { name: /delete/i })
      .last()
      .click();

    // Reload
    await page.reload();
    await page.waitForTimeout(1000);

    // Should not be there
    await expect(page.getByText("To Delete")).not.toBeVisible();

    // Should show empty state
    const emptyState = page.getByText(/create your first tier list/i);
    const getStarted = page.getByRole("button", { name: /get started/i });
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasGetStarted = await getStarted.isVisible().catch(() => false);
    expect(hasEmpty || hasGetStarted).toBe(true);
  });
});
