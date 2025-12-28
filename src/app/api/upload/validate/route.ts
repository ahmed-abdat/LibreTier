import { NextResponse } from "next/server";

interface ImgBBResponse {
  success: boolean;
  data?: {
    delete_url: string;
  };
  error?: {
    message: string;
    code: number;
  };
}

// Minimal 1x1 transparent PNG for testing (smallest possible valid image)
const TEST_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * Validate an imgbb API key by making a test upload
 * POST /api/upload/validate
 * Body: { apiKey: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey } = body as { apiKey?: string };

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      return NextResponse.json({
        valid: false,
        error: "API key is required",
      });
    }

    const trimmedKey = apiKey.trim();

    // Basic format validation (imgbb keys are typically 32 chars alphanumeric)
    if (!/^[a-zA-Z0-9]{20,40}$/.test(trimmedKey)) {
      return NextResponse.json({
        valid: false,
        error: "Invalid API key format",
      });
    }

    // Test the key by uploading a tiny image
    const formData = new FormData();
    formData.append("key", trimmedKey);
    formData.append("image", TEST_IMAGE_BASE64);
    formData.append("name", "libretier-api-test");

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const result: ImgBBResponse = await response.json();

    if (!result.success) {
      // Check for specific error messages
      const errorMsg = result.error?.message?.toLowerCase() ?? "";

      if (errorMsg.includes("invalid") || errorMsg.includes("key")) {
        return NextResponse.json({
          valid: false,
          error: "Invalid API key",
        });
      }

      if (errorMsg.includes("limit") || errorMsg.includes("rate")) {
        return NextResponse.json({
          valid: false,
          error: "Rate limit exceeded. Try again later.",
        });
      }

      return NextResponse.json({
        valid: false,
        error: result.error?.message ?? "API key validation failed",
      });
    }

    // Clean up: Delete the test image (best effort, don't fail if this fails)
    if (result.data?.delete_url) {
      fetch(result.data.delete_url).catch(() => {
        // Ignore cleanup errors
      });
    }

    return NextResponse.json({
      valid: true,
      message: "API key is valid",
    });
  } catch (error) {
    console.error("API key validation error:", error);

    if (error instanceof Error && error.message.includes("fetch")) {
      return NextResponse.json({
        valid: false,
        error: "Network error. Check your connection.",
      });
    }

    return NextResponse.json({
      valid: false,
      error: "Validation failed. Please try again.",
    });
  }
}
