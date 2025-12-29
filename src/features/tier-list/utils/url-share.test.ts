import { describe, it, expect, vi } from "vitest";
import {
  parseShareUrl,
  estimateShareUrlLength,
  canShareViaUrl,
} from "./url-share";
import type { TierList } from "../index";
import LZString from "lz-string";

// Mock the imgbb module to avoid actual uploads
vi.mock("@/lib/services/imgbb", () => ({
  uploadImages: vi.fn(),
}));

const createMockTierList = (): TierList => ({
  id: "test-list-1",
  title: "Test Tier List",
  description: "A test description",
  rows: [
    {
      id: "row-1",
      level: "S",
      color: "#FF7F7F",
      name: "S Tier",
      items: [
        {
          id: "item-1",
          name: "Item 1",
          imageUrl: "https://example.com/image.png",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      ],
    },
    {
      id: "row-2",
      level: "A",
      color: "#FFBF7F",
      name: "A Tier",
      items: [],
    },
  ],
  unassignedItems: [
    {
      id: "item-2",
      name: "Item 2",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
    },
  ],
  createdBy: "test-user",
  isPublic: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
});

describe("parseShareUrl", () => {
  it("returns null for empty hash", () => {
    expect(parseShareUrl("")).toBeNull();
  });

  it("returns null for invalid compressed data", () => {
    expect(parseShareUrl("invalid-data")).toBeNull();
  });

  it("parses valid compressed data", () => {
    const minimalExport = {
      v: 1,
      t: "Test List",
      r: [
        {
          l: "S",
          c: "#FF7F7F",
          i: [{ n: "Item 1" }],
        },
      ],
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(minimalExport)
    );

    const result = parseShareUrl(compressed);
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Test List");
    expect(result?.rows).toHaveLength(1);
    expect(result?.rows[0].level).toBe("S");
  });

  it("handles custom tier names", () => {
    const minimalExport = {
      v: 1,
      t: "Test",
      r: [
        {
          l: "S",
          c: "#FF0000",
          n: "Custom Name",
          i: [],
        },
      ],
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(minimalExport)
    );

    const result = parseShareUrl(compressed);
    expect(result?.rows[0].name).toBe("Custom Name");
  });

  it("handles unassigned items", () => {
    const minimalExport = {
      v: 1,
      t: "Test",
      r: [],
      u: [{ n: "Unassigned Item" }],
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(minimalExport)
    );

    const result = parseShareUrl(compressed);
    expect(result?.unassignedItems).toHaveLength(1);
    expect(result?.unassignedItems[0].name).toBe("Unassigned Item");
  });

  it("handles items with image URLs", () => {
    const minimalExport = {
      v: 1,
      t: "Test",
      r: [
        {
          l: "S",
          c: "#FF0000",
          i: [{ n: "Item", u: "https://example.com/img.png" }],
        },
      ],
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(minimalExport)
    );

    const result = parseShareUrl(compressed);
    expect(result?.rows[0].items[0].imageUrl).toBe(
      "https://example.com/img.png"
    );
  });

  it("handles items with descriptions", () => {
    const minimalExport = {
      v: 1,
      t: "Test",
      r: [
        {
          l: "S",
          c: "#FF0000",
          i: [{ n: "Item", d: "A description" }],
        },
      ],
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(minimalExport)
    );

    const result = parseShareUrl(compressed);
    expect(result?.rows[0].items[0].description).toBe("A description");
  });

  it("returns null for invalid version", () => {
    const minimalExport = {
      v: 99,
      t: "Test",
      r: [],
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(minimalExport)
    );

    expect(parseShareUrl(compressed)).toBeNull();
  });

  it("defaults to S tier for invalid level", () => {
    const minimalExport = {
      v: 1,
      t: "Test",
      r: [
        {
          l: "X",
          c: "#FF0000",
          i: [],
        },
      ],
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(minimalExport)
    );

    const result = parseShareUrl(compressed);
    expect(result?.rows[0].level).toBe("S");
  });

  it("defaults to gray for invalid color", () => {
    const minimalExport = {
      v: 1,
      t: "Test",
      r: [
        {
          l: "S",
          c: "invalid",
          i: [],
        },
      ],
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(minimalExport)
    );

    const result = parseShareUrl(compressed);
    expect(result?.rows[0].color).toBe("#808080");
  });
});

describe("estimateShareUrlLength", () => {
  it("returns a reasonable estimate for simple tier list", () => {
    const tierList = createMockTierList();
    const length = estimateShareUrlLength(tierList);

    expect(length).toBeGreaterThan(50);
    expect(length).toBeLessThan(1000);
  });

  it("increases with more items", () => {
    const tierList = createMockTierList();
    const length1 = estimateShareUrlLength(tierList);

    // Add more items
    tierList.rows[0].items.push({
      id: "item-3",
      name: "Another Item",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const length2 = estimateShareUrlLength(tierList);
    expect(length2).toBeGreaterThan(length1);
  });
});

describe("canShareViaUrl", () => {
  it("returns canShare true for small tier lists", () => {
    const tierList = createMockTierList();
    const result = canShareViaUrl(tierList);

    expect(result.canShare).toBe(true);
    expect(result.estimatedLength).toBeGreaterThan(0);
    expect(result.breakdown.totalItems).toBe(2);
  });

  it("provides breakdown information", () => {
    const tierList = createMockTierList();
    tierList.rows[0].items[0].imageUrl = "data:image/png;base64,abc123";

    const result = canShareViaUrl(tierList);

    expect(result.breakdown.rowCount).toBe(2);
    expect(result.breakdown.itemsWithImages).toBe(1);
    expect(result.breakdown.textOnlyItems).toBe(1);
  });

  it("calculates capacity percent", () => {
    const tierList = createMockTierList();
    const result = canShareViaUrl(tierList);

    expect(result.capacityPercent).toBeGreaterThan(0);
    expect(result.capacityPercent).toBeLessThan(100);
  });

  it("detects descriptions in items", () => {
    const tierList = createMockTierList();
    tierList.rows[0].items[0].description = "A description";

    const result = canShareViaUrl(tierList);
    expect(result.breakdown.hasDescriptions).toBe(true);
  });

  it("provides suggestions when images exceed threshold", () => {
    const tierList = createMockTierList();
    // Add 31+ items with images to trigger the "Remove some images" suggestion
    for (let i = 0; i < 32; i++) {
      tierList.rows[0].items.push({
        id: `item-${i + 10}`,
        name: `Item ${i + 10}`,
        imageUrl: "data:image/png;base64,abc123",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const result = canShareViaUrl(tierList);
    // itemsWithImages > 30 triggers suggestions
    expect(result.breakdown.itemsWithImages).toBeGreaterThan(30);
    if (result.suggestions) {
      expect(result.suggestions.some((s) => s.includes("image"))).toBe(true);
    }
  });
});
