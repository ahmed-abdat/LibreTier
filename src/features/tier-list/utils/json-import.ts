import { v4 as uuidv4 } from "uuid";
import type { TierList, TierRow, TierItem } from "../index";
import type { TierListExport } from "./json-export";
import { TIER_LEVELS, type TierLevel } from "../constants";
import {
  HEX_COLOR_REGEX,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_ITEM_NAME_LENGTH,
  MAX_TIER_NAME_LENGTH,
  MAX_FILE_SIZE,
} from "@/lib/constants";
import { fromISO } from "@/lib/date-utils";

// Validation result type
export interface ImportValidationResult {
  success: boolean;
  data?: TierListExport;
  error?: string;
}

// Valid tier levels set for O(1) lookup
const VALID_TIER_LEVELS = new Set<string>(TIER_LEVELS);

/**
 * Validates that a value is a valid tier item structure
 */
function isValidTierItem(item: unknown): item is Record<string, unknown> {
  if (!item || typeof item !== "object") return false;
  const i = item as Record<string, unknown>;

  // Required: name must be a non-empty string
  if (typeof i.name !== "string" || !i.name.trim()) return false;

  // Optional: imageUrl must be string if present
  if (i.imageUrl !== undefined && typeof i.imageUrl !== "string") return false;

  // Optional: description must be string if present
  if (i.description !== undefined && typeof i.description !== "string")
    return false;

  return true;
}

/**
 * Validates that a value is a valid tier row structure
 */
function isValidTierRow(row: unknown): row is Record<string, unknown> {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;

  // Check level is valid
  if (typeof r.level !== "string" || !VALID_TIER_LEVELS.has(r.level)) {
    return false;
  }

  // Check color is valid hex
  if (typeof r.color !== "string" || !HEX_COLOR_REGEX.test(r.color)) {
    return false;
  }

  // Check items array exists and is valid
  if (!Array.isArray(r.items)) return false;

  for (const item of r.items) {
    if (!isValidTierItem(item)) return false;
  }

  // Optional: name must be string if present
  if (r.name !== undefined && typeof r.name !== "string") return false;

  return true;
}

/**
 * Validates imported JSON data against the TierListExport schema
 */
export function validateTierListImport(json: unknown): ImportValidationResult {
  // 1. Check root structure
  if (!json || typeof json !== "object") {
    return { success: false, error: "Invalid JSON structure" };
  }

  const data = json as Record<string, unknown>;

  // 2. Check version
  if (data.version !== 1) {
    if (typeof data.version === "number" && data.version > 1) {
      return {
        success: false,
        error:
          "This file was created with a newer version. Please update the app.",
      };
    }
    return { success: false, error: "Invalid or missing version field" };
  }

  // 3. Check tierList exists
  if (!data.tierList || typeof data.tierList !== "object") {
    return { success: false, error: "Missing tier list data" };
  }

  const tierList = data.tierList as Record<string, unknown>;

  // 4. Validate required fields
  if (typeof tierList.title !== "string" || !tierList.title.trim()) {
    return { success: false, error: "Missing or invalid title" };
  }

  if (!Array.isArray(tierList.rows)) {
    return { success: false, error: "Missing or invalid rows" };
  }

  if (!Array.isArray(tierList.unassignedItems)) {
    return { success: false, error: "Missing or invalid unassigned items" };
  }

  // 5. Validate rows
  for (let i = 0; i < tierList.rows.length; i++) {
    if (!isValidTierRow(tierList.rows[i])) {
      return { success: false, error: `Invalid tier row at index ${i}` };
    }
  }

  // 6. Validate unassigned items
  for (let i = 0; i < tierList.unassignedItems.length; i++) {
    if (!isValidTierItem(tierList.unassignedItems[i])) {
      return { success: false, error: `Invalid item at index ${i}` };
    }
  }

  return { success: true, data: json as TierListExport };
}

/**
 * Transforms an imported item, generating new IDs and parsing dates
 */
function transformItem(item: Record<string, unknown>): TierItem {
  const now = new Date();
  return {
    id: uuidv4(),
    name: String(item.name).slice(0, MAX_ITEM_NAME_LENGTH),
    imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
    description: item.description
      ? String(item.description).slice(0, MAX_DESCRIPTION_LENGTH)
      : undefined,
    createdAt: fromISO(item.createdAt),
    updatedAt: now,
  };
}

/**
 * Transforms an imported row, generating new IDs and parsing dates
 */
function transformRow(row: Record<string, unknown>): TierRow {
  const items = row.items as Record<string, unknown>[];
  return {
    id: uuidv4(),
    level: row.level as TierLevel,
    color: String(row.color),
    name: row.name
      ? String(row.name).slice(0, MAX_TIER_NAME_LENGTH)
      : undefined,
    description: row.description
      ? String(row.description).slice(0, MAX_DESCRIPTION_LENGTH)
      : undefined,
    items: items.map(transformItem),
  };
}

/**
 * Transforms validated import data into a TierList (without id)
 * Generates new UUIDs for all entities to prevent conflicts
 */
export function transformImportToTierList(
  data: TierListExport
): Omit<TierList, "id"> {
  const now = new Date();
  const tierList = data.tierList;

  return {
    title: tierList.title.slice(0, MAX_TITLE_LENGTH),
    description: tierList.description?.slice(0, MAX_DESCRIPTION_LENGTH),
    rows: (tierList.rows as unknown as Record<string, unknown>[]).map(
      transformRow
    ),
    unassignedItems: (
      tierList.unassignedItems as unknown as Record<string, unknown>[]
    ).map(transformItem),
    createdBy: "local-user",
    isPublic: false,
    createdAt: fromISO(tierList.createdAt),
    updatedAt: now,
    tags: Array.isArray(tierList.tags)
      ? tierList.tags
          .filter((t): t is string => typeof t === "string")
          .slice(0, 10)
      : undefined,
  };
}

/**
 * Reads a JSON file and returns its parsed content
 */
export async function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      reject(new Error("Please select a JSON file"));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error("File too large. Maximum size is 10MB."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        resolve(parsed);
      } catch {
        reject(new Error("Invalid JSON format. File could not be parsed."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

/**
 * Full import pipeline: read file -> validate -> transform
 */
export async function importTierListFromFile(
  file: File
): Promise<Omit<TierList, "id">> {
  // 1. Read file
  const json = await readJSONFile(file);

  // 2. Validate
  const validation = validateTierListImport(json);
  if (!validation.success || !validation.data) {
    throw new Error(validation.error ?? "Invalid tier list file");
  }

  // 3. Transform
  return transformImportToTierList(validation.data);
}
