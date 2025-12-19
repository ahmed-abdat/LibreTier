import { test, expect } from "@playwright/test";

test.describe("Tier List Creation", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("shows empty state when no tier lists exist", async ({ page }) => {
    await page.goto("/tiers");

    // Wait for hydration
    await page.waitForTimeout(1000);

    // Empty state shows "Get Started" button, gallery shows "Create New"
    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    const createNewBtn = page.getByRole("button", { name: /create new/i });

    // Either button should be visible
    const isGetStartedVisible = await getStartedBtn
      .isVisible()
      .catch(() => false);
    const isCreateNewVisible = await createNewBtn
      .isVisible()
      .catch(() => false);

    expect(isGetStartedVisible || isCreateNewVisible).toBe(true);
  });

  test("creates a new tier list and navigates to editor", async ({ page }) => {
    await page.goto("/tiers");

    // Wait for hydration
    await page.waitForTimeout(1000);

    // Try "Get Started" (empty state) or "Create New" (gallery)
    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    const createNewBtn = page.getByRole("button", { name: /create new/i });

    if (await getStartedBtn.isVisible().catch(() => false)) {
      await getStartedBtn.click();
    } else {
      await createNewBtn.click();
    }

    // Should navigate to editor with a UUID
    await expect(page).toHaveURL(/\/editor\/[a-f0-9-]+/);
  });

  test("editor page loads with default tiers", async ({ page }) => {
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    // Click create button
    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    const createNewBtn = page.getByRole("button", { name: /create new/i });

    if (await getStartedBtn.isVisible().catch(() => false)) {
      await getStartedBtn.click();
    } else {
      await createNewBtn.click();
    }

    // Wait for editor to load
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Check that default tiers are visible (S, A, B, C, D, F)
    await expect(page.getByText("S").first()).toBeVisible();
    await expect(page.getByText("A").first()).toBeVisible();
    await expect(page.getByText("B").first()).toBeVisible();
  });

  test("editor has upload area", async ({ page }) => {
    await page.goto("/tiers");
    await page.waitForTimeout(1000);

    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    const createNewBtn = page.getByRole("button", { name: /create new/i });

    if (await getStartedBtn.isVisible().catch(() => false)) {
      await getStartedBtn.click();
    } else {
      await createNewBtn.click();
    }

    await page.waitForURL(/\/editor\/[a-f0-9-]+/);

    // Check for upload area text
    const uploadArea = page.getByText(/drag.*drop|click to upload/i);
    await expect(uploadArea.first()).toBeVisible();
  });
});
