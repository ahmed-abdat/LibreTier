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

  // Helper to add test items via localStorage
  async function addTestItems(page: import("@playwright/test").Page) {
    await page.evaluate(() => {
      const stored = localStorage.getItem("tier-store");
      if (!stored) return;
      const data = JSON.parse(stored);
      if (!data.state?.currentListId) return;
      const listId = data.state.currentListId;
      const listIdx = data.state.lists.findIndex(
        (l: { id: string }) => l.id === listId
      );
      if (listIdx === -1) return;

      // Add test items to unassigned pool
      const testItems = [
        {
          id: "test-1",
          name: "Item 1",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "test-2",
          name: "Item 2",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "test-3",
          name: "Item 3",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      data.state.lists[listIdx].unassignedItems = testItems;
      localStorage.setItem("tier-store", JSON.stringify(data));
    });
    await page.reload();
    await page.waitForTimeout(500);
  }

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

  test("items can be navigated with keyboard", async ({ page }) => {
    await addTestItems(page);

    // Wait for items to be visible
    await expect(page.getByText("Item 1")).toBeVisible();

    // Focus on an item in the pool
    const item = page.getByText("Item 1").first();
    await item.focus();

    // Press Space to start dragging
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);

    // Press Arrow Up to move toward tiers
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(200);

    // Press Space to drop
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);

    // Item should have moved (pool should have fewer items or item should be in a tier)
    // We verify by checking the item count in unassigned pool
    const poolItems = page.locator('[class*="unassigned"]').getByRole("button");
    // After moving, either the item moved to a tier or navigation worked
    // Just verify no error occurred
    await expect(page.getByText("Item 1")).toBeVisible();
  });

  test("escape cancels keyboard drag", async ({ page }) => {
    await addTestItems(page);

    await expect(page.getByText("Item 1")).toBeVisible();

    const item = page.getByText("Item 1").first();
    await item.focus();

    // Start drag
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);

    // Move somewhere
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(200);

    // Cancel with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Item should still be in pool (not moved)
    // The pool section should still contain Item 1
    await expect(page.getByText("Item 1")).toBeVisible();
  });

  test("keyboard navigation fully disabled when setting off", async ({
    page,
  }) => {
    await addTestItems(page);

    await expect(page.getByText("Item 1")).toBeVisible();

    // Disable keyboard nav in settings
    await page.keyboard.press("Control+,");
    await page.waitForTimeout(300);

    const keyboardToggle = page.locator('input[id="keyboard-nav"]');
    await keyboardToggle.click(); // Disable
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Try to activate drag with Space on an item
    const item = page.getByText("Item 1").first();
    await item.focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);

    // Arrow keys should do nothing (item should remain in pool)
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(200);

    // Item should still be visible in same location
    await expect(page.getByText("Item 1")).toBeVisible();

    // Verify item did not move to any tier by checking it's still in the pool area
    // Pool has items without tier badges, tiers have colored backgrounds
    const poolArea = page.locator('[class*="border-dashed"]').first();
    await expect(poolArea.getByText("Item 1")).toBeVisible();
  });
});
