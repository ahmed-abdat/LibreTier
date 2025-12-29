import { describe, it, expect } from "vitest";
import {
  isBase64Image,
  createTierListExport,
  formatFileSize,
  getItemsWithBase64Images,
} from "./json-export";
import type { TierList } from "../index";

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
  tags: ["tag1", "tag2"],
});

describe("isBase64Image", () => {
  it("returns true for base64 data URLs", () => {
    expect(isBase64Image("data:image/png;base64,abc123")).toBe(true);
    expect(isBase64Image("data:image/jpeg;base64,xyz789")).toBe(true);
    expect(isBase64Image("data:image/gif;base64,def456")).toBe(true);
  });

  it("returns false for regular URLs", () => {
    expect(isBase64Image("https://example.com/image.png")).toBe(false);
    expect(isBase64Image("http://example.com/image.jpg")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isBase64Image(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isBase64Image("")).toBe(false);
  });

  it("returns false for non-image data URLs", () => {
    expect(isBase64Image("data:text/plain;base64,abc")).toBe(false);
  });
});

describe("createTierListExport", () => {
  it("creates a valid export structure", () => {
    const tierList = createMockTierList();
    const result = createTierListExport(tierList);

    expect(result.version).toBe(1);
    expect(result.exportedAt).toBeDefined();
    expect(result.tierList.title).toBe("Test Tier List");
    expect(result.tierList.description).toBe("A test description");
  });

  it("serializes dates to ISO strings", () => {
    const tierList = createMockTierList();
    const result = createTierListExport(tierList);

    expect(result.tierList.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(result.tierList.updatedAt).toBe("2024-01-02T00:00:00.000Z");
    expect(result.tierList.rows[0].items[0].createdAt).toBe(
      "2024-01-01T00:00:00.000Z"
    );
  });

  it("includes all rows and items", () => {
    const tierList = createMockTierList();
    const result = createTierListExport(tierList);

    expect(result.tierList.rows).toHaveLength(1);
    expect(result.tierList.rows[0].items).toHaveLength(1);
    expect(result.tierList.unassignedItems).toHaveLength(1);
  });

  it("preserves tags", () => {
    const tierList = createMockTierList();
    const result = createTierListExport(tierList);

    expect(result.tierList.tags).toEqual(["tag1", "tag2"]);
  });

  it("replaces image URLs with map values", () => {
    const tierList = createMockTierList();
    const imageUrlMap = new Map([
      ["item-1", "https://cdn.example.com/new.png"],
    ]);
    const result = createTierListExport(tierList, imageUrlMap);

    expect(result.tierList.rows[0].items[0].imageUrl).toBe(
      "https://cdn.example.com/new.png"
    );
  });

  it("keeps original URL if not in map", () => {
    const tierList = createMockTierList();
    const imageUrlMap = new Map([
      ["other-id", "https://cdn.example.com/other.png"],
    ]);
    const result = createTierListExport(tierList, imageUrlMap);

    expect(result.tierList.rows[0].items[0].imageUrl).toBe(
      "https://example.com/image.png"
    );
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});

describe("getItemsWithBase64Images", () => {
  it("returns empty array when no base64 images", () => {
    const tierList = createMockTierList();
    const result = getItemsWithBase64Images(tierList);
    expect(result).toHaveLength(0);
  });

  it("finds base64 images in rows", () => {
    const tierList = createMockTierList();
    tierList.rows[0].items[0].imageUrl = "data:image/png;base64,abc123";
    const result = getItemsWithBase64Images(tierList);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("item-1");
    expect(result[0].base64).toBe("data:image/png;base64,abc123");
    expect(result[0].name).toBe("Item 1");
  });

  it("finds base64 images in unassigned items", () => {
    const tierList = createMockTierList();
    tierList.unassignedItems[0].imageUrl = "data:image/jpeg;base64,xyz789";
    const result = getItemsWithBase64Images(tierList);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("item-2");
  });

  it("finds multiple base64 images", () => {
    const tierList = createMockTierList();
    tierList.rows[0].items[0].imageUrl = "data:image/png;base64,abc";
    tierList.unassignedItems[0].imageUrl = "data:image/jpeg;base64,xyz";
    const result = getItemsWithBase64Images(tierList);

    expect(result).toHaveLength(2);
  });

  it("ignores items without images", () => {
    const tierList = createMockTierList();
    tierList.rows[0].items[0].imageUrl = undefined;
    const result = getItemsWithBase64Images(tierList);

    expect(result).toHaveLength(0);
  });
});
