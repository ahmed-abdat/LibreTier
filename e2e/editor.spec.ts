import { test, expect } from "@playwright/test";

test.describe("Editor Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and create a new tier list
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Create a new tier list
    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    if (await getStartedBtn.isVisible().catch(() => false)) {
      await getStartedBtn.click();
    }
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
  });

  test("can edit tier list title", async ({ page }) => {
    // Find the title input
    const titleInput = page.getByPlaceholder("Tier List Title");
    await expect(titleInput).toBeVisible();

    // Clear and type new title
    await titleInput.fill("My Custom Tier List");

    // Verify the value changed
    await expect(titleInput).toHaveValue("My Custom Tier List");
  });

  test("displays default tiers (S, A, B, C, D, F)", async ({ page }) => {
    // Check all default tiers are visible
    const tiers = ["S", "A", "B", "C", "D", "F"];
    for (const tier of tiers) {
      await expect(page.getByText(tier, { exact: true }).first()).toBeVisible();
    }
  });

  test("can add a new tier", async ({ page }) => {
    // Click "Add New Tier" button
    const addTierBtn = page.getByRole("button", { name: /add new tier/i });
    await expect(addTierBtn).toBeVisible();
    await addTierBtn.click();

    // Should show success toast
    await expect(page.getByText(/added tier/i)).toBeVisible();
  });

  test("shows reset confirmation dialog", async ({ page }) => {
    // Click reset button (icon button with RotateCcw icon, next to export button)
    const resetBtn = page.locator("button:has(svg.lucide-rotate-ccw)");
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Dialog should appear
    await expect(page.getByText("Reset Tier List?")).toBeVisible();
    await expect(page.getByText(/remove all items/i)).toBeVisible();

    // Cancel button should close dialog
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByText("Reset Tier List?")).not.toBeVisible();
  });

  test("has export button", async ({ page }) => {
    // Export button should be visible but may be disabled without items
    const exportBtn = page.getByRole("button", { name: /export|download/i });
    await expect(exportBtn.first()).toBeVisible();
  });

  test("shows upload area with correct text", async ({ page }) => {
    // Check for upload instructions
    await expect(
      page.getByText(/drag.*drop|click to upload/i).first()
    ).toBeVisible();
  });

  test("displays help text at bottom", async ({ page }) => {
    // Check help text is visible
    await expect(page.getByText(/drag.*items to rank/i)).toBeVisible();
    await expect(page.getByText(/tap.*tier labels/i)).toBeVisible();
  });

  test("shows item count", async ({ page }) => {
    // Should show "No items yet" initially
    await expect(page.getByText(/no items yet/i)).toBeVisible();
  });
});
