import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useShareableExport } from "./useShareableExport";
import type { TierList } from "../index";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/lib/services/imgbb", () => ({
  uploadImages: vi.fn(),
}));

vi.mock("../utils/json-export", () => ({
  downloadTierListAsJSON: vi.fn(),
  downloadShareableTierListAsJSON: vi.fn(),
  formatFileSize: vi.fn((bytes: number) => `${bytes} B`),
  getItemsWithBase64Images: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    child: () => ({
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

import { toast } from "sonner";
import { uploadImages } from "@/lib/services/imgbb";
import {
  downloadTierListAsJSON,
  downloadShareableTierListAsJSON,
  getItemsWithBase64Images,
} from "../utils/json-export";

const createMockTierList = (): TierList => ({
  id: "test-list-1",
  title: "Test Tier List",
  rows: [
    {
      id: "row-1",
      level: "S",
      color: "#FF7F7F",
      items: [
        {
          id: "item-1",
          name: "Item 1",
          imageUrl: "https://example.com/image.png",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
  ],
  unassignedItems: [],
  createdBy: "test-user",
  isPublic: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("useShareableExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: shareable enabled
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ shareableEnabled: true }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts with backup export mode", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      expect(result.current.exportMode).toBe("backup");

      // Wait for config check to complete
      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });
    });

    it("starts with idle export state", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      expect(result.current.exportState).toBe("idle");

      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });
    });

    it("starts with null upload progress", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      expect(result.current.uploadProgress).toBeNull();

      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });
    });

    it("starts with null shareableEnabled (loading)", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      // Initially null until config check completes
      expect(result.current.shareableEnabled).toBeNull();

      // Wait for it to resolve
      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });
    });
  });

  describe("config check", () => {
    it("checks shareable config on mount", async () => {
      renderHook(() => useShareableExport({ tierList: createMockTierList() }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/upload/config",
          expect.any(Object)
        );
      });
    });

    it("sets shareableEnabled to true when config returns true", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await waitFor(() => {
        expect(result.current.shareableEnabled).toBe(true);
      });
    });

    it("sets shareableEnabled to false when config returns false", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ shareableEnabled: false }),
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await waitFor(() => {
        expect(result.current.shareableEnabled).toBe(false);
      });
    });

    it("sets shareableEnabled to false on fetch error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await waitFor(() => {
        expect(result.current.shareableEnabled).toBe(false);
      });
    });
  });

  describe("setExportMode", () => {
    it("changes export mode", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      // Wait for config check
      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });

      act(() => {
        result.current.setExportMode("shareable");
      });

      expect(result.current.exportMode).toBe("shareable");
    });
  });

  describe("handleSimpleExport", () => {
    it("shows error when no tier list", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: null })
      );

      // Wait for config check (returns false for null tierList scenario)
      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });

      act(() => {
        result.current.handleSimpleExport();
      });

      expect(toast.error).toHaveBeenCalledWith("No tier list to export");
    });

    it("calls downloadTierListAsJSON", async () => {
      vi.mocked(downloadTierListAsJSON).mockReturnValue({
        success: true,
        fileSizeBytes: 1000,
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });

      act(() => {
        result.current.handleSimpleExport();
      });

      expect(downloadTierListAsJSON).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it("shows large file warning for files over 1MB", async () => {
      vi.mocked(downloadTierListAsJSON).mockReturnValue({
        success: true,
        fileSizeBytes: 2 * 1024 * 1024,
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });

      act(() => {
        result.current.handleSimpleExport();
      });

      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("large file")
      );
    });

    it("sets isExportingSimple during export", async () => {
      vi.mocked(downloadTierListAsJSON).mockReturnValue({
        success: true,
        fileSizeBytes: 1000,
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });

      // Note: This happens synchronously so we can't easily test the intermediate state
      act(() => {
        result.current.handleSimpleExport();
      });

      expect(result.current.isExportingSimple).toBe(false);
    });
  });

  describe("handleExport (backup mode)", () => {
    it("shows error when no tier list", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: null })
      );

      await act(async () => {
        await result.current.handleExport();
      });

      expect(toast.error).toHaveBeenCalledWith("No tier list to export");
    });

    it("exports as backup when mode is backup", async () => {
      vi.mocked(downloadTierListAsJSON).mockReturnValue({
        success: true,
        fileSizeBytes: 500,
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await act(async () => {
        await result.current.handleExport();
      });

      expect(downloadTierListAsJSON).toHaveBeenCalled();
      expect(result.current.exportState).toBe("success");
    });
  });

  describe("handleExport (shareable mode)", () => {
    beforeEach(() => {
      vi.mocked(getItemsWithBase64Images).mockReturnValue([]);
    });

    it("exports without upload when no base64 images", async () => {
      vi.mocked(downloadShareableTierListAsJSON).mockReturnValue({
        success: true,
        fileSizeBytes: 200,
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      act(() => {
        result.current.setExportMode("shareable");
      });

      await act(async () => {
        await result.current.handleExport();
      });

      expect(uploadImages).not.toHaveBeenCalled();
      expect(downloadShareableTierListAsJSON).toHaveBeenCalled();
    });

    it("uploads images when base64 images exist", async () => {
      vi.mocked(getItemsWithBase64Images).mockReturnValue([
        { id: "item-1", base64: "data:image/png;base64,abc", name: "Item 1" },
      ]);
      vi.mocked(uploadImages).mockResolvedValue(
        new Map([["item-1", { url: "https://uploaded.com/img.png" }]])
      );
      vi.mocked(downloadShareableTierListAsJSON).mockReturnValue({
        success: true,
        fileSizeBytes: 200,
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      act(() => {
        result.current.setExportMode("shareable");
      });

      await act(async () => {
        await result.current.handleExport();
      });

      expect(uploadImages).toHaveBeenCalled();
      expect(downloadShareableTierListAsJSON).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Map)
      );
    });

    it("shows error when all uploads fail", async () => {
      vi.mocked(getItemsWithBase64Images).mockReturnValue([
        { id: "item-1", base64: "data:image/png;base64,abc", name: "Item 1" },
      ]);
      vi.mocked(uploadImages).mockResolvedValue(new Map());

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      act(() => {
        result.current.setExportMode("shareable");
      });

      await act(async () => {
        await result.current.handleExport();
      });

      expect(result.current.exportState).toBe("error");
      expect(toast.error).toHaveBeenCalledWith(
        "All image uploads failed. Check your internet connection."
      );
    });
  });

  describe("handleCancel", () => {
    it("resets state on cancel", async () => {
      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await waitFor(() => {
        expect(result.current.shareableEnabled).not.toBeNull();
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.exportState).toBe("idle");
      expect(result.current.uploadProgress).toBeNull();
    });
  });

  describe("resetState", () => {
    it("resets export state to idle", async () => {
      vi.mocked(downloadTierListAsJSON).mockReturnValue({
        success: true,
        fileSizeBytes: 500,
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList() })
      );

      await act(async () => {
        await result.current.handleExport();
      });

      expect(result.current.exportState).toBe("success");

      act(() => {
        result.current.resetState();
      });

      expect(result.current.exportState).toBe("idle");
      expect(result.current.uploadProgress).toBeNull();
      expect(result.current.currentImageName).toBe("");
    });
  });

  describe("onSuccess callback", () => {
    it("calls onSuccess after successful export", async () => {
      vi.useFakeTimers();
      const onSuccess = vi.fn();

      vi.mocked(downloadTierListAsJSON).mockReturnValue({
        success: true,
        fileSizeBytes: 500,
      });

      const { result } = renderHook(() =>
        useShareableExport({ tierList: createMockTierList(), onSuccess })
      );

      await act(async () => {
        await result.current.handleExport();
      });

      // Fast-forward timers (onSuccess is called after 1000ms delay)
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onSuccess).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
