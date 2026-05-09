import LZString from "lz-string";
import type { TierList, TierRow, TierItem } from "../index";
import type { TierLevel } from "../constants";
import { TIER_LEVELS } from "../constants";
import { getItemsWithBase64Images, isBase64Image } from "./json-export";
import { uploadImage, uploadImages } from "@/lib/services/imgbb";
import { logger } from "@/lib/logger";
import {
  isValidHexColor,
  MAX_URL_LENGTH,
  MAX_DECOMPRESSED_SIZE,
  SITE_URL,
} from "@/lib/constants";
import {
  SHARE_VERSION,
  isValidMinimalExport,
  type MinimalExport,
  type MinimalItem,
  type MinimalRow,
} from "./share-schema";

const log = logger.child("UrlShare");

// Re-export schema types so existing call sites keep working.
export {
  SHARE_VERSION,
  isValidMinimalExport,
  type MinimalExport,
  type MinimalItem,
  type MinimalRow,
};

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
 * Decompress data from URL with size limit protection
 */
function decompressFromUrl(compressed: string): MinimalExport | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    // Prevent decompression bombs by limiting decompressed size
    if (json.length > MAX_DECOMPRESSED_SIZE) {
      logger.warn("Decompressed data exceeds size limit");
      return null;
    }

    return JSON.parse(json) as MinimalExport;
  } catch {
    return null;
  }
}

export interface ShareOptions {
  onProgress?: (progress: ShareProgress) => void;
  customApiKey?: string;
  /**
   * Optional PNG screenshot of the tier list. When provided, it's uploaded
   * to imgbb and used as the OG image for `/share/<id>` previews.
   */
  screenshotBlob?: Blob;
}

interface CreateShortShareResponse {
  success: boolean;
  id?: string;
  error?: { code?: string; message?: string };
}

/**
 * Convert a Blob to a base64 data URL (browser only).
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader error"));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("FileReader returned non-string"));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Try to create a short share URL via POST /api/share. Returns null when the
 * store is unavailable (no Upstash env vars set) or any other error occurs,
 * so the caller can fall back to the hash-based URL.
 */
async function createShortShareUrl(
  baseUrl: string,
  data: MinimalExport,
  ogImageUrl: string | undefined
): Promise<string | null> {
  try {
    const response = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, ogImageUrl }),
    });

    if (response.status === 503) return null; // store not configured -> fall back

    const result = (await response.json()) as CreateShortShareResponse;
    if (!response.ok || !result.success || !result.id) {
      log.warn("Short share creation failed", {
        status: response.status,
        code: result.error?.code,
      });
      return null;
    }

    return `${baseUrl}/share/${result.id}`;
  } catch (error) {
    log.warn("Short share request failed", { error: String(error) });
    return null;
  }
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
  const { onProgress, customApiKey, screenshotBlob } = opts;

  try {
    // 1. Get items with base64 images that need uploading
    const itemsWithImages = getItemsWithBase64Images(tierList);
    const imageUrlMap = new Map<string, string>();

    // 2. Upload images if any
    if (itemsWithImages.length > 0) {
      onProgress?.({
        status: "uploading",
        message: `Uploading ${itemsWithImages.length} image${itemsWithImages.length > 1 ? "s" : ""}...`,
        current: 0,
        total: itemsWithImages.length,
      });

      try {
        const uploadResults = await uploadImages(
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
        // Extract just the URLs for the minimal export
        for (const [id, result] of uploadResults) {
          imageUrlMap.set(id, result.url);
        }
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

    // 3. Optionally upload the OG screenshot. Failure here is non-fatal —
    //    the share still works, just without a per-list preview image.
    let ogImageUrl: string | undefined;
    if (screenshotBlob) {
      onProgress?.({
        status: "uploading",
        message: "Uploading preview image...",
      });
      try {
        const dataUrl = await blobToDataUrl(screenshotBlob);
        const result = await uploadImage(
          dataUrl,
          `libretier-preview-${Date.now()}.png`,
          { customApiKey }
        );
        if (result.success && result.url) ogImageUrl = result.url;
        else log.warn("OG screenshot upload failed", { error: result.error });
      } catch (error) {
        log.warn("OG screenshot upload threw", { error: String(error) });
      }
    }

    // 4. Build the minimal payload
    onProgress?.({
      status: "compressing",
      message: "Creating share link...",
    });

    const minimalData = toMinimalExport(tierList, imageUrlMap);

    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : SITE_URL;

    // 5. Try the short-ID flow first. Falls back to hash URL when the share
    //    store isn't configured or the request fails for any reason.
    const shortUrl = await createShortShareUrl(
      baseUrl,
      minimalData,
      ogImageUrl
    );
    if (shortUrl) {
      onProgress?.({ status: "done", message: "Share link created!" });
      return { success: true, url: shortUrl, urlLength: shortUrl.length };
    }

    // 6. Fallback: hash-based URL
    const compressed = compressForUrl(minimalData);
    const shareUrl = `${baseUrl}/share#${compressed}`;

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
 * Reconstruct a TierList from a MinimalExport (the server-stored or
 * URL-decoded payload). Validates schema version and required fields.
 * Returns null if the payload is invalid.
 */
export function minimalExportToTierList(data: unknown): TierList | null {
  if (!isValidMinimalExport(data)) {
    const version =
      data && typeof data === "object" && "v" in data
        ? (data as { v: unknown }).v
        : undefined;
    log.warn("Invalid share payload", { version });
    return null;
  }

  try {
    const now = new Date();

    const toTierItem = (item: MinimalItem, index: number): TierItem => ({
      id: `shared-item-${index}-${Date.now()}`,
      name: item.n || "Untitled",
      imageUrl: item.u,
      description: item.d,
      createdAt: now,
      updatedAt: now,
    });

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
 * Parse a share URL hash and return the tier list data.
 * @param hash The URL hash (without the # prefix)
 * @returns Parsed tier list or null if invalid
 */
export function parseShareUrl(hash: string): TierList | null {
  if (!hash) return null;
  const data = decompressFromUrl(hash);
  if (!data) return null;
  return minimalExportToTierList(data);
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
