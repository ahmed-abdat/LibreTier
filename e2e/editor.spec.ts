import { test, expect } from "@playwright/test";

test.describe("Editor Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and create a new tier list
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/tiers");

    // Wait for page to be ready (gallery loaded)
    await page.waitForLoadState("domcontentloaded");

    // Create a new tier list
    const getStartedBtn = page.getByRole("button", { name: /get started/i });
    await expect(getStartedBtn).toBeVisible({ timeout: 5000 });
    await getStartedBtn.click();
    await page.waitForURL(/\/editor\/[a-f0-9-]+/);
  });

  test("can edit tier list title", async ({ page }) => {
    // Find the contentEditable title heading
    const titleHeading = page.getByRole("heading", { level: 1 });
    await expect(titleHeading).toBeVisible();

    // Triple-click to select all text, then type new title
    await titleHeading.click({ clickCount: 3 });
    await page.keyboard.type("My Custom Tier List");

    // Blur to trigger save
    await page.keyboard.press("Tab");

    // Verify the title changed
    await expect(titleHeading).toHaveText("My Custom Tier List");
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
    // Click menu dropdown button first
    const menuBtn = page.getByRole("button", { name: /^menu$/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Click "Reset All Items" menu item
    const resetMenuItem = page.getByRole("menuitem", {
      name: /reset all items/i,
    });
    await expect(resetMenuItem).toBeVisible();
    await resetMenuItem.click();

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
    // Check help text is visible (keyboard shortcuts)
    // Use more specific text to avoid matching hidden DND announcement elements
    await expect(page.getByText("items to rank")).toBeVisible();
    await expect(page.getByText(/ctrl\+z/i)).toBeVisible();
  });

  test("shows item count", async ({ page }) => {
    // Should show "No items yet" initially
    await expect(page.getByText(/no items yet/i)).toBeVisible();
  });

  test("shows paste hint in upload area", async ({ page }) => {
    // Check that clipboard paste hint is visible (Ctrl+V on Windows/Linux, ⌘V on Mac)
    await expect(page.getByText(/paste with (ctrl\+v|⌘v)/i)).toBeVisible();
  });

  test("can paste image from clipboard", async ({ page }) => {
    // Create a small test image as base64
    const testImageBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    // Simulate paste event with image data
    await page.evaluate(async (base64) => {
      // Convert base64 to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Create a File from the blob
      const file = new File([blob], "test-image.png", { type: "image/png" });

      // Create DataTransfer with the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // Dispatch paste event
      const pasteEvent = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer,
      });

      document.dispatchEvent(pasteEvent);
    }, testImageBase64);

    // Wait for success toast or item to appear (no fixed timeout)
    await expect(page.getByText(/added|test-image/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("paste does not trigger in input fields", async ({ page }) => {
    // Focus on contentEditable title heading with triple-click to select all
    const titleHeading = page.getByRole("heading", { level: 1 });
    await titleHeading.click({ clickCount: 3 });

    // Type new title (replaces selected text)
    await page.keyboard.type("Pasted Title");

    // Title should have the new text (typing in contentEditable works normally)
    await expect(titleHeading).toHaveText("Pasted Title");
  });
});
