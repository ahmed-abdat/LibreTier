import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
}

// Allowlist of exact imgbb hostnames to prevent SSRF attacks
// Only these specific domains are allowed for image deletion
const ALLOWED_IMGBB_HOSTS = new Set([
  "ibb.co",
  "i.ibb.co",
  "imgbb.com",
  "www.imgbb.com",
]);

/**
 * Validates that a URL is a legitimate imgbb delete URL
 * Uses exact hostname matching to prevent SSRF attacks
 */
function isValidImgbbDeleteUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;

  try {
    const url = new URL(urlStr);

    // Must be HTTPS
    if (url.protocol !== "https:") return false;

    // Must be an exact match to allowed hosts (prevents evil-ibb.co attacks)
    if (!ALLOWED_IMGBB_HOSTS.has(url.hostname)) return false;

    // Must have a valid path (imgbb delete URLs have specific patterns)
    if (!url.pathname || url.pathname === "/") return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Delete images from imgbb using their delete URLs
 * POST /api/upload/delete
 * Body: { deleteUrls: string[] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deleteUrls } = body as { deleteUrls: string[] };

    if (!Array.isArray(deleteUrls) || deleteUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          deletedCount: 0,
          errors: ["No delete URLs provided"],
        },
        { status: 400 }
      );
    }

    // Filter valid imgbb delete URLs using strict validation
    const validUrls = deleteUrls.filter(isValidImgbbDeleteUrl);

    if (validUrls.length === 0) {
      return NextResponse.json(
        { success: true, deletedCount: 0, errors: [] },
        { status: 200 }
      );
    }

    const errors: string[] = [];
    let deletedCount = 0;

    // Delete images with rate limiting (500ms between requests)
    for (let i = 0; i < validUrls.length; i++) {
      const deleteUrl = validUrls[i];

      try {
        // imgbb delete URLs are visited via GET request
        const response = await fetch(deleteUrl, {
          method: "GET",
          redirect: "follow",
        });

        if (response.ok || response.status === 404) {
          // 404 means already deleted, which is fine
          deletedCount++;
        } else {
          errors.push(
            `Failed to delete: ${deleteUrl} (status: ${response.status})`
          );
        }
      } catch (error) {
        errors.push(
          `Error deleting ${deleteUrl}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }

      // Rate limit: wait 500ms between deletions (except last one)
      if (i < validUrls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      deletedCount,
      errors,
    });
  } catch (error) {
    logger.prod.error("Image deletion error", error as Error);
    return NextResponse.json(
      {
        success: false,
        deletedCount: 0,
        errors: [
          error instanceof Error ? error.message : "Internal server error",
        ],
      },
      { status: 500 }
    );
  }
}
