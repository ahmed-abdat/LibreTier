import { test, expect } from "@playwright/test";

test.describe("LocalStorage Persistence", () => {
  test("tier list persists after page reload", async ({ page }) => {
    // Clear localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // Create a tier list
    await page.goto("/tiers");
    await page.waitForLoadState("domcontentloaded");

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await expect(getStartedBtn).toBeVisible({ timeout: 5000 });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Edit title (contentEditable heading)
    const titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("Persistent List");
    await page.keyboard.press("Tab");

    // Wait for the heading to show the new title (confirms save)
    await expect(titleHeading).toHaveText("Persistent List");

    // Reload the page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Title should still be there
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Persistent List"
    );
  });

  test("tier list persists in gallery after reload", async ({ page }) => {
    // Clear localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // Create a tier list
    await page.goto("/tiers");
    await page.waitForLoadState("domcontentloaded");

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await expect(getStartedBtn).toBeVisible({ timeout: 5000 });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Edit title (contentEditable heading)
    const titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("Gallery Test");
    await page.keyboard.press("Tab");

    // Wait for the heading to show the new title (confirms save)
    await expect(titleHeading).toHaveText("Gallery Test");

    // Go to gallery
    await page.goto("/tiers");
    await page.waitForLoadState("domcontentloaded");

    // Verify it's there
    await expect(page.getByText("Gallery Test")).toBeVisible();

    // Reload
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Still there after reload
    await expect(page.getByText("Gallery Test")).toBeVisible();
  });

  test("multiple tier lists persist correctly", async ({ page }) => {
    // Clear localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // Create first tier list
    await page.goto("/tiers");
    await page.waitForLoadState("domcontentloaded");

    let getStartedBtn = page.getByRole("button", { name: /get started/i });
    await expect(getStartedBtn).toBeVisible({ timeout: 5000 });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
    // Edit title
    let titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("First List");
    await page.keyboard.press("Tab");
    await expect(titleHeading).toHaveText("First List");

    // Create second tier list
    await page.goto("/tiers");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: /create new/i }).click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
    titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("Second List");
    await page.keyboard.press("Tab");
    await expect(titleHeading).toHaveText("Second List");

    // Create third tier list
    await page.goto("/tiers");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: /create new/i }).click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
    titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("Third List");
    await page.keyboard.press("Tab");
    await expect(titleHeading).toHaveText("Third List");

    // Go to gallery and reload
    await page.goto("/tiers");
    await page.waitForLoadState("domcontentloaded");
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

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
    await page.waitForLoadState("domcontentloaded");

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await expect(getStartedBtn).toBeVisible({ timeout: 5000 });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
    // Edit title
    const titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("To Delete");
    await page.keyboard.press("Tab");
    await expect(titleHeading).toHaveText("To Delete");

    // Go to gallery
    await page.goto("/tiers");
    await page.waitForLoadState("domcontentloaded");

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

    // Wait for delete confirmation
    await expect(page.getByText(/deleted/i)).toBeVisible();

    // Reload
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

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
