import LZString from "lz-string";
import type { TierList, TierRow, TierItem } from "../index";
import type { TierLevel } from "../constants";
import { TIER_LEVELS } from "../constants";
import { getItemsWithBase64Images, isBase64Image } from "./json-export";
import { uploadImages } from "@/lib/services/imgbb";

// Maximum URL length for broad browser compatibility
const MAX_URL_LENGTH = 8000;

// Minimal export schema version
const SHARE_VERSION = 1;

/**
 * Minimal item structure for URL sharing (short keys to reduce size)
 */
interface MinimalItem {
  n: string; // name
  u?: string; // image URL (imgbb URL, not base64)
  d?: string; // description (optional)
}

/**
 * Minimal row structure for URL sharing
 */
interface MinimalRow {
  l: string; // level (S/A/B/C/D/F)
  c: string; // color (hex)
  n?: string; // custom name (optional)
  i: MinimalItem[]; // items
}

/**
 * Minimal export structure for URL sharing
 */
interface MinimalExport {
  v: number; // version
  t: string; // title
  r: MinimalRow[]; // rows
  u?: MinimalItem[]; // unassigned items
}

export interface ShareResult {
  success: boolean;
  url?: string;
  error?: string;
  tooLarge?: boolean;
  urlLength?: number;
}

export interface ShareProgress {
  status: "idle" | "uploading" | "compressing" | "done" | "error";
  message: string;
  current?: number;
  total?: number;
}

/**
 * Convert a TierItem to minimal format
 */
function toMinimalItem(item: TierItem, imageUrlOverride?: string): MinimalItem {
  const minimal: MinimalItem = {
    n: item.name,
  };

  const imageUrl = imageUrlOverride ?? item.imageUrl;
  if (imageUrl && !isBase64Image(imageUrl)) {
    minimal.u = imageUrl;
  } else if (imageUrlOverride) {
    minimal.u = imageUrlOverride;
  }

  if (item.description) {
    minimal.d = item.description;
  }

  return minimal;
}

/**
 * Convert a TierRow to minimal format
 */
function toMinimalRow(
  row: TierRow,
  imageUrlMap?: Map<string, string>
): MinimalRow {
  const minimal: MinimalRow = {
    l: row.level,
    c: row.color,
    i: row.items.map((item) => toMinimalItem(item, imageUrlMap?.get(item.id))),
  };

  if (row.name && row.name !== row.level) {
    minimal.n = row.name;
  }

  return minimal;
}

/**
 * Convert a TierList to minimal export format
 */
function toMinimalExport(
  tierList: TierList,
  imageUrlMap?: Map<string, string>
): MinimalExport {
  const minimal: MinimalExport = {
    v: SHARE_VERSION,
    t: tierList.title,
    r: tierList.rows.map((row) => toMinimalRow(row, imageUrlMap)),
  };

  if (tierList.unassignedItems.length > 0) {
    minimal.u = tierList.unassignedItems.map((item) =>
      toMinimalItem(item, imageUrlMap?.get(item.id))
    );
  }

  return minimal;
}

/**
 * Compress data for URL
 */
function compressForUrl(data: MinimalExport): string {
  const json = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decompress data from URL
 */
function decompressFromUrl(compressed: string): MinimalExport | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json) as MinimalExport;
  } catch {
    return null;
  }
}

export interface ShareOptions {
  onProgress?: (progress: ShareProgress) => void;
  customApiKey?: string;
}

/**
 * Create a shareable URL for a tier list
 * @param tierList The tier list to share
 * @param options Optional settings (progress callback, custom API key)
 * @returns ShareResult with URL or error
 */
export async function createShareableUrl(
  tierList: TierList,
  options?: ShareOptions | ((progress: ShareProgress) => void)
): Promise<ShareResult> {
  // Support legacy signature (just onProgress function)
  const opts: ShareOptions =
    typeof options === "function" ? { onProgress: options } : (options ?? {});
  const { onProgress, customApiKey } = opts;

  try {
    // 1. Get items with base64 images that need uploading
    const itemsWithImages = getItemsWithBase64Images(tierList);
    let imageUrlMap = new Map<string, string>();

    // 2. Upload images if any
    if (itemsWithImages.length > 0) {
      onProgress?.({
        status: "uploading",
        message: `Uploading ${itemsWithImages.length} image${itemsWithImages.length > 1 ? "s" : ""}...`,
        current: 0,
        total: itemsWithImages.length,
      });

      try {
        imageUrlMap = await uploadImages(
          itemsWithImages,
          (current, total) => {
            onProgress?.({
              status: "uploading",
              message: `Uploading image ${current} of ${total}...`,
              current,
              total,
            });
          },
          { customApiKey }
        );
      } catch (uploadError) {
        return {
          success: false,
          error:
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload images. Please try again.",
        };
      }
    }

    // 3. Compress
    onProgress?.({
      status: "compressing",
      message: "Creating share link...",
    });

    const minimalData = toMinimalExport(tierList, imageUrlMap);
    const compressed = compressForUrl(minimalData);

    // 4. Generate URL
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://libretier.vercel.app";
    const shareUrl = `${baseUrl}/share#${compressed}`;

    // 5. Check length
    if (shareUrl.length > MAX_URL_LENGTH) {
      return {
        success: false,
        error: `Share URL is too long (${shareUrl.length.toLocaleString()} characters). Try removing some items or using JSON export instead.`,
        tooLarge: true,
        urlLength: shareUrl.length,
      };
    }

    onProgress?.({
      status: "done",
      message: "Share link created!",
    });

    return {
      success: true,
      url: shareUrl,
      urlLength: shareUrl.length,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create share link. Please try again.",
    };
  }
}

/**
 * Validate a tier level string
 */
function isValidTierLevel(level: string): level is TierLevel {
  return TIER_LEVELS.includes(level as TierLevel);
}

/**
 * Validate a hex color string
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Parse a share URL and return the tier list data
 * @param hash The URL hash (without the # prefix)
 * @returns Parsed tier list or null if invalid
 */
export function parseShareUrl(hash: string): TierList | null {
  if (!hash) return null;

  const data = decompressFromUrl(hash);
  if (!data) return null;

  // Validate version
  if (data.v !== SHARE_VERSION) {
    console.warn(`Unknown share version: ${data.v}`);
    return null;
  }

  // Validate required fields
  if (!data.t || !Array.isArray(data.r)) {
    return null;
  }

  try {
    const now = new Date();

    // Convert minimal items to TierItems
    const toTierItem = (item: MinimalItem, index: number): TierItem => ({
      id: `shared-item-${index}-${Date.now()}`,
      name: item.n || "Untitled",
      imageUrl: item.u,
      description: item.d,
      createdAt: now,
      updatedAt: now,
    });

    // Convert minimal rows to TierRows
    const rows: TierRow[] = data.r.map((row, rowIndex) => {
      const level = isValidTierLevel(row.l) ? row.l : "S";
      const color = isValidHexColor(row.c) ? row.c : "#808080";

      return {
        id: `shared-row-${rowIndex}-${Date.now()}`,
        level,
        color,
        name: row.n ?? level,
        items: row.i.map((item, itemIndex) =>
          toTierItem(item, rowIndex * 100 + itemIndex)
        ),
      };
    });

    // Convert unassigned items
    const unassignedItems: TierItem[] = (data.u ?? []).map((item, index) =>
      toTierItem(item, 1000 + index)
    );

    return {
      id: `shared-${Date.now()}`,
      title: data.t || "Shared Tier List",
      rows,
      unassignedItems,
      createdBy: "shared",
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    };
  } catch {
    return null;
  }
}

/**
 * Estimate the URL length for a tier list (without actually uploading images)
 * This is useful for showing a warning before the user commits to sharing
 */
export function estimateShareUrlLength(tierList: TierList): number {
  // Create a mock imageUrlMap with placeholder URLs
  const itemsWithImages = getItemsWithBase64Images(tierList);
  const mockUrlMap = new Map<string, string>();

  // imgbb URLs are typically ~50 chars
  itemsWithImages.forEach((item) => {
    mockUrlMap.set(item.id, "https://i.ibb.co/XXXXXXXXX/image.jpg");
  });

  const minimalData = toMinimalExport(tierList, mockUrlMap);
  const compressed = compressForUrl(minimalData);

  // Add base URL length estimate
  return compressed.length + 50; // ~50 chars for domain + path
}

export interface ShareabilityResult {
  canShare: boolean;
  estimatedLength: number;
  warning?: string;
  /** Capacity used as percentage (0-100+) */
  capacityPercent: number;
  /** Breakdown of what's using space */
  breakdown: {
    totalItems: number;
    itemsWithImages: number;
    textOnlyItems: number;
    rowCount: number;
    hasDescriptions: boolean;
  };
  /** Suggestions for reducing size */
  suggestions?: string[];
}

/**
 * Check if a tier list can be shared via URL with detailed breakdown
 */
export function canShareViaUrl(tierList: TierList): ShareabilityResult {
  const estimatedLength = estimateShareUrlLength(tierList);
  const capacityPercent = Math.round((estimatedLength / MAX_URL_LENGTH) * 100);

  // Count items
  const allItems = [
    ...tierList.unassignedItems,
    ...tierList.rows.flatMap((row) => row.items),
  ];
  const itemsWithImages = getItemsWithBase64Images(tierList).length;
  const textOnlyItems = allItems.length - itemsWithImages;
  const hasDescriptions = allItems.some((item) => item.description);

  const breakdown = {
    totalItems: allItems.length,
    itemsWithImages,
    textOnlyItems,
    rowCount: tierList.rows.length,
    hasDescriptions,
  };

  // Generate suggestions based on what's using space
  const suggestions: string[] = [];
  if (itemsWithImages > 30) {
    suggestions.push("Remove some images to reduce URL size");
  }
  if (hasDescriptions) {
    suggestions.push("Descriptions add to URL length");
  }
  if (allItems.some((item) => item.name.length > 50)) {
    suggestions.push("Shorten long item names");
  }

  if (estimatedLength > MAX_URL_LENGTH) {
    return {
      canShare: false,
      estimatedLength,
      capacityPercent,
      breakdown,
      warning: `Too large for URL sharing (~${Math.round(estimatedLength / 1000)}KB). Use JSON export instead.`,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ["Use JSON export for large tier lists"],
    };
  }

  if (capacityPercent > 80) {
    return {
      canShare: true,
      estimatedLength,
      capacityPercent,
      breakdown,
      warning: `Near capacity (${capacityPercent}%). May not work on all browsers.`,
      suggestions,
    };
  }

  return {
    canShare: true,
    estimatedLength,
    capacityPercent,
    breakdown,
  };
}
