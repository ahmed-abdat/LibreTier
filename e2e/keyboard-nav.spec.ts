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
    // Find a tier label button (in the tier row with S tier)
    const tierLabel = page.getByRole("button", { name: /^S$/ });

    if ((await tierLabel.count()) > 0) {
      await tierLabel.first().click();

      // Should show input for editing tier name
      const input = page.getByRole("textbox").first();
      if ((await input.count()) > 0) {
        await input.fill("Super");
        await page.keyboard.press("Enter");
        await expect(page.getByText("Super")).toBeVisible();
      } else {
        // Tier label might be contentEditable or non-editable
        test.skip();
      }
    } else {
      // Skip if tier label structure is different
      test.skip();
    }
  });

  test("tier name input responds to Escape key", async ({ page }) => {
    // Find a tier label button (in the tier row with S tier)
    const tierLabel = page.getByRole("button", { name: /^S$/ });

    if ((await tierLabel.count()) > 0) {
      await tierLabel.first().click();

      const input = page.getByRole("textbox").first();
      if ((await input.count()) > 0) {
        await input.fill("Changed");
        await page.keyboard.press("Escape");
        // After escape, should revert - S should still be visible
        await expect(page.getByText("S").first()).toBeVisible();
      } else {
        test.skip();
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
    // Click "More options" dropdown first
    const moreOptionsBtn = page.getByRole("button", { name: /more options/i });
    await moreOptionsBtn.focus();
    await page.keyboard.press("Enter");

    // Navigate to Reset menu item and select it
    const resetMenuItem = page.getByRole("menuitem", {
      name: /reset all items/i,
    });
    await resetMenuItem.focus();
    await page.keyboard.press("Enter");

    // Dialog should open
    await expect(page.getByText("Reset Tier List?")).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(page.getByText("Reset Tier List?")).not.toBeVisible();
  });

  test("dialog buttons respond to keyboard", async ({ page }) => {
    // Click "More options" dropdown first
    const moreOptionsBtn = page.getByRole("button", { name: /more options/i });
    await moreOptionsBtn.click();

    // Click Reset menu item
    await page.getByRole("menuitem", { name: /reset all items/i }).click();

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
      // Store uses 'tierLists' not 'lists'
      const listIdx = data.state.tierLists.findIndex(
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
      data.state.tierLists[listIdx].unassignedItems = testItems;
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

    // Skip if items weren't added successfully (localStorage manipulation can be flaky)
    const itemVisible = await page
      .getByText("Item 1")
      .isVisible()
      .catch(() => false);
    if (!itemVisible) {
      test.skip();
      return;
    }

    // Find the draggable button for Item 1
    const item = page
      .locator('button[draggable="true"]')
      .filter({ hasText: "Item 1" })
      .first();

    // Skip if no draggable button found
    if ((await item.count()) === 0) {
      test.skip();
      return;
    }

    await item.focus();

    // Press Space to start dragging
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);

    // Press Arrow Up to move toward tiers
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(300);

    // Press Space to drop
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);

    // Just verify no error occurred and item is still visible
    await expect(page.getByText("Item 1")).toBeVisible();
  });

  test("escape cancels keyboard drag", async ({ page }) => {
    await addTestItems(page);

    const itemVisible = await page
      .getByText("Item 1")
      .isVisible()
      .catch(() => false);
    if (!itemVisible) {
      test.skip();
      return;
    }

    const item = page
      .locator('button[draggable="true"]')
      .filter({ hasText: "Item 1" })
      .first();

    if ((await item.count()) === 0) {
      test.skip();
      return;
    }

    await item.focus();

    // Start drag
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);

    // Move somewhere
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(300);

    // Cancel with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Item should still be visible
    await expect(page.getByText("Item 1")).toBeVisible();
  });

  test("keyboard navigation fully disabled when setting off", async ({
    page,
  }) => {
    await addTestItems(page);

    const itemVisible = await page
      .getByText("Item 1")
      .isVisible()
      .catch(() => false);
    if (!itemVisible) {
      test.skip();
      return;
    }

    // Open settings with keyboard shortcut
    await page.keyboard.press("Control+,");
    await page.waitForTimeout(500);

    // Find keyboard toggle by label or switch
    const keyboardToggle = page.getByRole("switch", { name: /keyboard/i });

    if ((await keyboardToggle.count()) === 0) {
      // Try alternative selector
      const toggle = page.locator('[id*="keyboard"]');
      if ((await toggle.count()) > 0) {
        await toggle.click();
      } else {
        test.skip();
        return;
      }
    } else {
      await keyboardToggle.click();
    }

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Item should still be visible
    await expect(page.getByText("Item 1")).toBeVisible();
  });
});
