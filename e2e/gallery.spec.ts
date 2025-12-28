import { test, expect } from "@playwright/test";

test.describe("Gallery Management", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("shows empty state when no tier lists", async ({ page }) => {
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Should show empty state with "Create Your First Tier List" or "Get Started"
    const emptyStateText = page.getByText(/create your first tier list/i);
    const getStartedBtn = page.getByRole("button", { name: /get started/i });

    const hasEmptyState = await emptyStateText.isVisible().catch(() => false);
    const hasGetStarted = await getStartedBtn.isVisible().catch(() => false);

    expect(hasEmptyState || hasGetStarted).toBe(true);
  });

  test("displays tier list card after creation", async ({ page }) => {
    // Create a tier list
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Edit title (contentEditable heading)
    const titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("Test Tier List");
    await page.keyboard.press("Tab");

    // Go back to gallery
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Should show the tier list card
    await expect(page.getByText("Test Tier List")).toBeVisible();
    await expect(page.getByText(/0 items/i)).toBeVisible();
  });

  test("can search tier lists", async ({ page }) => {
    // Create two tier lists with different names
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Create first list
    let getStartedBtn = page.getByRole("button", { name: /get started/i });
    const createNewBtn = page.getByRole("button", { name: /create new/i });

    if (await getStartedBtn.isVisible().catch(() => false)) {
      await getStartedBtn.click();
    } else {
      await createNewBtn.click();
    }
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Edit title (contentEditable heading)
    const titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("Alpha List");
    await page.keyboard.press("Tab");
    await page.goto("/tiers");
    await page.waitForTimeout(500);

    // Create second list
    await page.getByRole("button", { name: /create new/i }).click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Edit title (contentEditable heading)
    const titleHeading2 = page.getByRole("heading", { level: 1 });
    await titleHeading2.click({ clickCount: 3 });
    await page.keyboard.type("Beta List");
    await page.keyboard.press("Tab");
    await page.goto("/tiers");
    await page.waitForTimeout(500);

    // Both should be visible
    await expect(page.getByText("Alpha List")).toBeVisible();
    await expect(page.getByText("Beta List")).toBeVisible();

    // Search for "Alpha"
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Alpha");

    // Only Alpha should be visible
    await expect(page.getByText("Alpha List")).toBeVisible();
    await expect(page.getByText("Beta List")).not.toBeVisible();

    // Clear search
    await searchInput.fill("");
    await expect(page.getByText("Beta List")).toBeVisible();
  });

  test("shows tier list count", async ({ page }) => {
    // Create a tier list first
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Go back to gallery
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Should show count
    await expect(page.getByText(/you have 1 tier list/i)).toBeVisible();
  });
});

test.describe("Tier List Actions", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and create a tier list
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Create a tier list
    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Edit title (contentEditable heading)
    const titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("Original List");
    await page.keyboard.press("Tab");
    await page.goto("/tiers");
    await page.waitForTimeout(1000);
  });

  test("can duplicate tier list via menu", async ({ page }) => {
    // Hover over card to show menu
    const card = page.getByText("Original List");
    await card.hover();

    // Click the more options button
    const moreBtn = page.locator('button:has-text("")').filter({
      has: page.locator("svg"),
    });

    // Find and click the menu trigger on the card
    const menuTrigger = page
      .locator(".group")
      .filter({ hasText: "Original List" })
      .getByRole("button")
      .first();
    await menuTrigger.click();

    // Click duplicate
    await page.getByRole("menuitem", { name: /duplicate/i }).click();

    // Should show success toast
    await expect(page.getByText("Tier list duplicated!")).toBeVisible();

    // Should now have 2 tier lists
    await expect(page.getByText(/you have 2 tier lists/i)).toBeVisible();
  });

  test("can delete tier list with confirmation", async ({ page }) => {
    // Hover over card to show menu
    const card = page.getByText("Original List");
    await card.hover();

    // Find and click the menu trigger on the card
    const menuTrigger = page
      .locator(".group")
      .filter({ hasText: "Original List" })
      .getByRole("button")
      .first();
    await menuTrigger.click();

    // Click delete
    await page.getByRole("menuitem", { name: /delete/i }).click();

    // Confirmation dialog should appear
    await expect(page.getByText("Delete Tier List?")).toBeVisible();

    // Cancel first
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(
      page.locator("h3").filter({ hasText: "Original List" })
    ).toBeVisible();

    // Now actually delete
    await menuTrigger.click();
    await page.getByRole("menuitem", { name: /delete/i }).click();
    await page
      .getByRole("button", { name: /delete/i })
      .last()
      .click();

    // Should show success toast and empty state
    await expect(page.getByText(/deleted/i)).toBeVisible();
  });

  test("can click card to edit tier list", async ({ page }) => {
    // Click on the tier list card
    await page.getByText("Original List").click();

    // Should navigate to editor
    await expect(page).toHaveURL(/\/editor\/[a-f0-9-]+/);

    // Title should be preserved (contentEditable heading)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Original List"
    );
  });
});
