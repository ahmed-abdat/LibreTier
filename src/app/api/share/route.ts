import { NextResponse } from "next/server";
import {
  createShare,
  isShareStoreConfigured,
} from "@/lib/services/share-store";
import { isValidMinimalExport } from "@/features/tier-list/utils/share-schema";
import { logger } from "@/lib/logger";

const MAX_PAYLOAD_BYTES = 200 * 1024; // 200KB - generous for any realistic tier list

export async function POST(request: Request) {
  if (!isShareStoreConfigured()) {
    return jsonError("store_unavailable", "Share store not configured", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_json", "Invalid JSON body", 400);
  }

  const { data, ogImageUrl } = (body ?? {}) as {
    data?: unknown;
    ogImageUrl?: unknown;
  };

  if (!isValidMinimalExport(data)) {
    return jsonError(
      "invalid_payload",
      "Missing or invalid `data` (MinimalExport).",
      400
    );
  }

  const ogUrl = typeof ogImageUrl === "string" ? ogImageUrl : undefined;
  if (ogUrl && !isHttpUrl(ogUrl)) {
    return jsonError(
      "invalid_og_url",
      "ogImageUrl must be an http(s) URL.",
      400
    );
  }

  const serialized = JSON.stringify({ data, ogImageUrl: ogUrl });
  if (serialized.length > MAX_PAYLOAD_BYTES) {
    return jsonError(
      "payload_too_large",
      `Payload exceeds ${MAX_PAYLOAD_BYTES} bytes.`,
      413
    );
  }

  try {
    const id = await createShare({ data, ogImageUrl: ogUrl });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    logger.prod.error("Failed to create share", error as Error);
    return jsonError("store_error", "Failed to store share.", 500);
  }
}

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
