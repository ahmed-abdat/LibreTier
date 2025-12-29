import { describe, it, expect } from "vitest";
import {
  validateTierListImport,
  transformImportToTierList,
} from "./json-import";

describe("validateTierListImport", () => {
  const validExport = {
    version: 1,
    exportedAt: "2024-01-01T00:00:00.000Z",
    tierList: {
      title: "Test Tier List",
      rows: [
        {
          level: "S",
          color: "#FF7F7F",
          items: [{ name: "Item 1" }],
        },
      ],
      unassignedItems: [],
    },
  };

  it("validates a valid export", () => {
    const result = validateTierListImport(validExport);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("rejects null input", () => {
    const result = validateTierListImport(null);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid JSON structure");
  });

  it("rejects non-object input", () => {
    const result = validateTierListImport("string");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid JSON structure");
  });

  it("rejects invalid version", () => {
    const result = validateTierListImport({ ...validExport, version: 0 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid or missing version field");
  });

  it("suggests update for newer version", () => {
    const result = validateTierListImport({ ...validExport, version: 2 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("newer version");
  });

  it("rejects missing tierList", () => {
    const result = validateTierListImport({ version: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing tier list data");
  });

  it("rejects missing title", () => {
    const result = validateTierListImport({
      version: 1,
      tierList: { rows: [], unassignedItems: [] },
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing or invalid title");
  });

  it("rejects empty title", () => {
    const result = validateTierListImport({
      version: 1,
      tierList: { title: "   ", rows: [], unassignedItems: [] },
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing or invalid title");
  });

  it("rejects missing rows", () => {
    const result = validateTierListImport({
      version: 1,
      tierList: { title: "Test", unassignedItems: [] },
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing or invalid rows");
  });

  it("rejects invalid tier level", () => {
    const result = validateTierListImport({
      version: 1,
      tierList: {
        title: "Test",
        rows: [{ level: "X", color: "#FF0000", items: [] }],
        unassignedItems: [],
      },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid tier row");
  });

  it("rejects invalid hex color", () => {
    const result = validateTierListImport({
      version: 1,
      tierList: {
        title: "Test",
        rows: [{ level: "S", color: "red", items: [] }],
        unassignedItems: [],
      },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid tier row");
  });

  it("rejects item with empty name", () => {
    const result = validateTierListImport({
      version: 1,
      tierList: {
        title: "Test",
        rows: [{ level: "S", color: "#FF0000", items: [{ name: "" }] }],
        unassignedItems: [],
      },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid tier row");
  });

  it("validates items with optional fields", () => {
    const result = validateTierListImport({
      version: 1,
      tierList: {
        title: "Test",
        rows: [
          {
            level: "S",
            color: "#FF0000",
            items: [
              {
                name: "Item",
                imageUrl: "https://example.com/image.png",
                description: "Description",
              },
            ],
          },
        ],
        unassignedItems: [],
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("transformImportToTierList", () => {
  const validExport = {
    version: 1,
    exportedAt: "2024-01-01T00:00:00.000Z",
    tierList: {
      title: "Test Tier List",
      description: "A test description",
      rows: [
        {
          level: "S",
          color: "#FF7F7F",
          name: "Super",
          items: [
            {
              name: "Item 1",
              imageUrl: "https://example.com/image.png",
              createdAt: "2024-01-01T00:00:00.000Z",
            },
          ],
        },
      ],
      unassignedItems: [{ name: "Unassigned Item" }],
      createdAt: "2024-01-01T00:00:00.000Z",
      tags: ["tag1", "tag2"],
    },
  };

  it("transforms a valid export to TierList", () => {
    const result = transformImportToTierList(validExport);
    expect(result.title).toBe("Test Tier List");
    expect(result.description).toBe("A test description");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].level).toBe("S");
    expect(result.rows[0].items).toHaveLength(1);
    expect(result.unassignedItems).toHaveLength(1);
  });

  it("generates new UUIDs for all entities", () => {
    const result = transformImportToTierList(validExport);
    expect(result.rows[0].id).toBeDefined();
    expect(result.rows[0].items[0].id).toBeDefined();
    expect(result.unassignedItems[0].id).toBeDefined();
  });

  it("truncates long titles", () => {
    const longTitle = "A".repeat(300);
    const result = transformImportToTierList({
      ...validExport,
      tierList: { ...validExport.tierList, title: longTitle },
    });
    expect(result.title.length).toBe(200);
  });

  it("truncates long descriptions", () => {
    const longDesc = "A".repeat(2000);
    const result = transformImportToTierList({
      ...validExport,
      tierList: { ...validExport.tierList, description: longDesc },
    });
    expect(result.description?.length).toBe(1000);
  });

  it("parses date strings to Date objects", () => {
    const result = transformImportToTierList(validExport);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.rows[0].items[0].createdAt).toBeInstanceOf(Date);
  });

  it("handles missing dates with fallback", () => {
    const exportWithoutDates = {
      version: 1,
      tierList: {
        title: "Test",
        rows: [{ level: "S", color: "#FF0000", items: [] }],
        unassignedItems: [],
      },
    };
    const result = transformImportToTierList(exportWithoutDates);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("filters and limits tags", () => {
    const exportWithManyTags = {
      ...validExport,
      tierList: {
        ...validExport.tierList,
        tags: [
          1,
          "tag1",
          "tag2",
          "tag3",
          "tag4",
          "tag5",
          "tag6",
          "tag7",
          "tag8",
          "tag9",
          "tag10",
          "tag11",
        ],
      },
    };
    const result = transformImportToTierList(exportWithManyTags);
    expect(result.tags).toHaveLength(10);
    expect(result.tags).not.toContain(1);
  });

  it("sets createdBy to local-user", () => {
    const result = transformImportToTierList(validExport);
    expect(result.createdBy).toBe("local-user");
  });

  it("sets isPublic to false", () => {
    const result = transformImportToTierList(validExport);
    expect(result.isPublic).toBe(false);
  });
});
