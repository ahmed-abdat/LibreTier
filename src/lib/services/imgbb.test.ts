import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadImage, uploadImages, deleteImages } from "./imgbb";

describe("imgbb service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("uploadImage", () => {
    it("successfully uploads an image", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            success: true,
            url: "https://i.ibb.co/abc123/image.png",
            deleteUrl: "https://ibb.co/delete/abc123",
          }),
      });

      const result = await uploadImage("data:image/png;base64,abc", "test.png");

      expect(result.success).toBe(true);
      expect(result.url).toBe("https://i.ibb.co/abc123/image.png");
      expect(result.deleteUrl).toBe("https://ibb.co/delete/abc123");
    });

    it("sends correct payload to API", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: true, url: "https://test.com" }),
      });

      await uploadImage("data:image/png;base64,abc", "test.png", {
        customApiKey: "custom-key",
      });

      expect(global.fetch).toHaveBeenCalledWith("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: "data:image/png;base64,abc",
          name: "test.png",
          customApiKey: "custom-key",
        }),
        signal: undefined,
      });
    });

    it("handles API error response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: "Invalid image format" },
          }),
      });

      const result = await uploadImage("invalid-data");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid image format");
    });

    it("handles API error without message", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            success: false,
          }),
      });

      const result = await uploadImage("data:image/png;base64,abc");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Upload failed");
    });

    it("handles network error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await uploadImage("data:image/png;base64,abc");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("handles abort signal", async () => {
      const abortError = new Error("Cancelled");
      abortError.name = "AbortError";
      global.fetch = vi.fn().mockRejectedValue(abortError);

      const result = await uploadImage("data:image/png;base64,abc");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cancelled");
    });

    it("passes abort signal to fetch", async () => {
      const controller = new AbortController();
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: true, url: "https://test.com" }),
      });

      await uploadImage("data:image/png;base64,abc", undefined, {
        signal: controller.signal,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/upload",
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
  });

  describe("uploadImages", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("uploads multiple images", async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              url: "https://i.ibb.co/img1.png",
              deleteUrl: "https://ibb.co/delete/1",
            }),
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              url: "https://i.ibb.co/img2.png",
              deleteUrl: "https://ibb.co/delete/2",
            }),
        });

      const images = [
        { id: "item-1", base64: "data:image/png;base64,abc", name: "Image 1" },
        { id: "item-2", base64: "data:image/png;base64,xyz", name: "Image 2" },
      ];

      const uploadPromise = uploadImages(images);

      // Fast-forward the delay timers
      await vi.advanceTimersByTimeAsync(500);
      await vi.advanceTimersByTimeAsync(500);

      const result = await uploadPromise;

      expect(result.size).toBe(2);
      expect(result.get("item-1")).toEqual({
        url: "https://i.ibb.co/img1.png",
        deleteUrl: "https://ibb.co/delete/1",
      });
      expect(result.get("item-2")).toEqual({
        url: "https://i.ibb.co/img2.png",
        deleteUrl: "https://ibb.co/delete/2",
      });
    });

    it("calls onProgress callback", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            success: true,
            url: "https://i.ibb.co/img.png",
          }),
      });

      const onProgress = vi.fn();
      const images = [
        { id: "item-1", base64: "data:image/png;base64,abc" },
        { id: "item-2", base64: "data:image/png;base64,xyz" },
      ];

      const uploadPromise = uploadImages(images, onProgress);

      // Advance timers to complete uploads
      await vi.advanceTimersByTimeAsync(1000);

      await uploadPromise;

      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenNthCalledWith(1, 1, 2);
      expect(onProgress).toHaveBeenNthCalledWith(2, 2, 2);
    });

    it("handles empty images array", async () => {
      const result = await uploadImages([]);

      expect(result.size).toBe(0);
    });

    it("stops on abort signal", async () => {
      const controller = new AbortController();
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            success: true,
            url: "https://i.ibb.co/img.png",
          }),
      });

      const images = [
        { id: "item-1", base64: "data:image/png;base64,abc" },
        { id: "item-2", base64: "data:image/png;base64,xyz" },
        { id: "item-3", base64: "data:image/png;base64,123" },
      ];

      // Start upload and abort after first
      const uploadPromise = uploadImages(images, undefined, {
        signal: controller.signal,
      });

      // Let first upload complete, then abort
      await vi.advanceTimersByTimeAsync(100);
      controller.abort();
      await vi.advanceTimersByTimeAsync(1000);

      const result = await uploadPromise;

      // Should only have completed 1 upload before abort
      expect(result.size).toBeLessThanOrEqual(1);
    });

    it("throws on non-cancelled upload failure", async () => {
      // Use real timers for this test to avoid unhandled rejection issues
      vi.useRealTimers();

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              url: "https://i.ibb.co/img1.png",
            }),
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: false,
              error: { message: "Rate limit exceeded" },
            }),
        });

      const images = [
        { id: "item-1", base64: "data:image/png;base64,abc" },
        { id: "item-2", base64: "data:image/png;base64,xyz" },
      ];

      // Await the rejection directly
      await expect(uploadImages(images)).rejects.toThrow("Rate limit exceeded");

      // Restore fake timers for other tests
      vi.useFakeTimers();
    });
  });

  describe("deleteImages", () => {
    it("successfully deletes images", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            success: true,
            deletedCount: 2,
            errors: [],
          }),
      });

      const result = await deleteImages([
        "https://ibb.co/delete/1",
        "https://ibb.co/delete/2",
      ]);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it("sends correct payload to API", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({ success: true, deletedCount: 1, errors: [] }),
      });

      await deleteImages(["https://ibb.co/delete/1"]);

      expect(global.fetch).toHaveBeenCalledWith("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteUrls: ["https://ibb.co/delete/1"] }),
      });
    });

    it("handles network error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await deleteImages(["https://ibb.co/delete/1"]);

      expect(result.success).toBe(false);
      expect(result.deletedCount).toBe(0);
      expect(result.errors).toContain("Network error");
    });

    it("handles unknown error type", async () => {
      global.fetch = vi.fn().mockRejectedValue("Unknown error");

      const result = await deleteImages(["https://ibb.co/delete/1"]);

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Network error");
    });
  });
});
