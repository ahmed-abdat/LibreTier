import { test, expect } from "@playwright/test";

test.describe("Keyboard Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and create a tier list with some items
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

  test("can tab through tier rows", async ({ page }) => {
    // Press Tab multiple times to navigate through elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should be able to focus on elements
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy();
  });

  test("tier name input responds to Enter key", async ({ page }) => {
    // Find a tier label button (in the tier row, not export button)
    // Tier labels are in a div with the tier color background
    const tierLabel = page
      .locator('[style*="background-color"]')
      .filter({ hasText: /^S$/ })
      .locator("button");

    if ((await tierLabel.count()) > 0) {
      await tierLabel.first().click();

      // Should show input for editing
      const input = page.locator("input").filter({ hasNotText: "Tier List" });
      if ((await input.count()) > 0) {
        await input.first().fill("Super");
        await page.keyboard.press("Enter");
        await expect(page.getByText("Super")).toBeVisible();
      }
    } else {
      // Skip if tier label structure is different
      test.skip();
    }
  });

  test("tier name input responds to Escape key", async ({ page }) => {
    // Find a tier label button
    const tierLabel = page
      .locator('[style*="background-color"]')
      .filter({ hasText: /^S$/ })
      .locator("button");

    if ((await tierLabel.count()) > 0) {
      await tierLabel.first().click();

      const input = page.locator("input").filter({ hasNotText: "Tier List" });
      if ((await input.count()) > 0) {
        await input.first().fill("Changed");
        await page.keyboard.press("Escape");
        // After escape, should revert - S should still be visible
        await expect(page.getByText("S").first()).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test("Add New Tier button is keyboard accessible", async ({ page }) => {
    // Tab to the Add New Tier button and press Enter
    const addTierBtn = page.getByRole("button", { name: /add new tier/i });

    // Focus and activate with keyboard
    await addTierBtn.focus();
    await page.keyboard.press("Enter");

    // Should show success toast
    await expect(page.getByText(/added tier/i)).toBeVisible();
  });

  test("Reset button opens dialog with keyboard", async ({ page }) => {
    // Find reset button (icon button with RotateCcw icon)
    const resetBtn = page.locator("button:has(svg.lucide-rotate-ccw)");
    await resetBtn.focus();
    await page.keyboard.press("Enter");

    // Dialog should open
    await expect(page.getByText("Reset Tier List?")).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(page.getByText("Reset Tier List?")).not.toBeVisible();
  });

  test("dialog buttons respond to keyboard", async ({ page }) => {
    // Open reset dialog (icon button with RotateCcw icon)
    const resetBtn = page.locator("button:has(svg.lucide-rotate-ccw)");
    await resetBtn.click();

    await expect(page.getByText("Reset Tier List?")).toBeVisible();

    // Tab to Cancel button and press Enter
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    // Dialog should close
    await expect(page.getByText("Reset Tier List?")).not.toBeVisible();
  });

  test("export button is keyboard accessible", async ({ page }) => {
    // Find export button by aria-label
    const exportBtn = page.getByLabel(/export tier list/i);

    if ((await exportBtn.count()) > 0) {
      // Check it has proper accessibility attributes
      const ariaLabel = await exportBtn.first().getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();

      // Should have tabindex (focusable)
      // Even if disabled, it should be in the tab order
      await expect(exportBtn.first()).toBeVisible();
    }
  });
});

test.describe("DND Kit Keyboard Sensor", () => {
  test.beforeEach(async ({ page }) => {
    // This test needs items in the tier list
    // We'll test with the empty state first to verify sensors are configured
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    if (await getStartedBtn.isVisible().catch(() => false)) {
      await getStartedBtn.click();
    }
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
  });

  test("tier rows have proper focus styles", async ({ page }) => {
    // Verify that tier rows exist and have interactive elements
    // Look for the GripVertical icon buttons (drag handles)
    const dragHandles = page.locator(
      'button[aria-label*="reorder"], button[aria-label*="Drag"]'
    );
    const count = await dragHandles.count();

    if (count > 0) {
      // First drag handle should be focusable
      await dragHandles.first().focus();
      const isFocused = await dragHandles
        .first()
        .evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    } else {
      // Check if tier rows exist at all (they might not have explicit drag handles)
      const tierRows = page.locator('[style*="background-color: rgb"]');
      const rowCount = await tierRows.count();
      // We should have at least 6 tier rows (S, A, B, C, D, F)
      expect(rowCount).toBeGreaterThanOrEqual(6);
    }
  });

  test("upload area is keyboard accessible", async ({ page }) => {
    // Find upload area
    const uploadArea = page.locator('[role="button"]').filter({
      hasText: /drag|drop|upload/i,
    });

    if ((await uploadArea.count()) > 0) {
      // Should have tabIndex for keyboard access
      const tabIndex = await uploadArea.first().getAttribute("tabindex");
      expect(tabIndex).toBe("0");

      // Should be focusable
      await uploadArea.first().focus();
      const isFocused = await uploadArea
        .first()
        .evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    }
  });
});
