import { NextResponse } from "next/server";

export interface ImgBBUploadResponse {
  success: boolean;
  data?: {
    id: string;
    url: string;
    display_url: string;
    delete_url: string;
    thumb: { url: string };
    medium?: { url: string };
  };
  error?: {
    message: string;
    code: number;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, name, customApiKey } = body as {
      image: string;
      name?: string;
      customApiKey?: string;
    };

    // Use custom API key if provided, otherwise fall back to environment variable
    const apiKey = customApiKey ?? process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Image upload service not configured. Please add your own ImgBB API key in Settings.",
            code: 503,
          },
        },
        { status: 503 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { success: false, error: { message: "No image provided", code: 400 } },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("image", base64Data);
    if (name) {
      formData.append("name", name);
    }

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const result: ImgBBUploadResponse = await response.json();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? { message: "Upload failed", code: 500 },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.data?.display_url ?? result.data?.url,
      deleteUrl: result.data?.delete_url,
    });
  } catch (error) {
    console.error("ImgBB upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Internal server error", code: 500 },
      },
      { status: 500 }
    );
  }
}
