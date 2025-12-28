"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { TierList } from "../index";
import {
  downloadTierListAsJSON,
  downloadShareableTierListAsJSON,
  formatFileSize,
  getItemsWithBase64Images,
} from "../utils/json-export";
import { uploadImages } from "@/lib/services/imgbb";

export type ExportMode = "backup" | "shareable";
export type ExportState = "idle" | "uploading" | "success" | "error";

interface UseShareableExportOptions {
  tierList: TierList | null;
  onSuccess?: () => void;
}

interface UploadProgress {
  current: number;
  total: number;
}

interface UseShareableExportResult {
  exportMode: ExportMode;
  setExportMode: (mode: ExportMode) => void;
  exportState: ExportState;
  uploadProgress: UploadProgress | null;
  currentImageName: string;
  shareableEnabled: boolean | null;
  handleExport: () => Promise<void>;
  handleSimpleExport: () => void;
  handleCancel: () => void;
  resetState: () => void;
  isExportingSimple: boolean;
}

export function useShareableExport({
  tierList,
  onSuccess,
}: UseShareableExportOptions): UseShareableExportResult {
  const [exportMode, setExportMode] = useState<ExportMode>("backup");
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [currentImageName, setCurrentImageName] = useState<string>("");
  const [shareableEnabled, setShareableEnabled] = useState<boolean | null>(
    null
  );
  const [isExportingSimple, setIsExportingSimple] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const exportSucceededRef = useRef(false);

  // Check if shareable export is available (API key configured)
  useEffect(() => {
    const controller = new AbortController();

    async function checkConfig() {
      try {
        const res = await fetch("/api/upload/config", {
          signal: controller.signal,
        });
        const data = (await res.json()) as { shareableEnabled: boolean };
        setShareableEnabled(data.shareableEnabled);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setShareableEnabled(false);
        }
      }
    }
    void checkConfig();

    return () => controller.abort();
  }, []);

  const resetState = useCallback(() => {
    setExportState("idle");
    setUploadProgress(null);
    setCurrentImageName("");
  }, []);

  const handleSimpleExport = useCallback(() => {
    if (!tierList) {
      toast.error("No tier list to export");
      return;
    }

    setIsExportingSimple(true);

    try {
      const result = downloadTierListAsJSON(tierList);
      if (result.success) {
        const sizeStr = formatFileSize(result.fileSizeBytes);
        if (result.fileSizeBytes > 1024 * 1024) {
          toast.success(
            `Exported! (${sizeStr} - large file due to embedded images)`
          );
        } else {
          toast.success(`Tier list exported (${sizeStr})`);
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export tier list");
    } finally {
      setIsExportingSimple(false);
    }
  }, [tierList]);

  const handleExport = useCallback(async () => {
    if (!tierList) {
      toast.error("No tier list to export");
      return;
    }

    abortControllerRef.current = new AbortController();
    exportSucceededRef.current = false;
    setExportState("uploading");

    try {
      if (exportMode === "backup") {
        const result = downloadTierListAsJSON(tierList);
        if (result.success) {
          exportSucceededRef.current = true;
          setExportState("success");
          const sizeStr = formatFileSize(result.fileSizeBytes);
          toast.success(`Backup exported successfully (${sizeStr})`);
          setTimeout(() => {
            onSuccess?.();
            resetState();
          }, 1000);
        }
      } else {
        const itemsWithImages = getItemsWithBase64Images(tierList);

        if (itemsWithImages.length === 0) {
          const result = downloadShareableTierListAsJSON(tierList, new Map());
          if (result.success) {
            exportSucceededRef.current = true;
            setExportState("success");
            toast.success(
              `Exported! (${formatFileSize(result.fileSizeBytes)})`
            );
            setTimeout(() => {
              onSuccess?.();
              resetState();
            }, 1000);
          }
          return;
        }

        setUploadProgress({
          current: 0,
          total: itemsWithImages.length,
        });

        const signal = abortControllerRef.current.signal;
        const imageUrlMap = await uploadImages(
          itemsWithImages,
          (current, total) => {
            if (signal.aborted) return;
            setUploadProgress({ current, total });
            setCurrentImageName(itemsWithImages[current - 1]?.name ?? "");
          },
          { signal }
        );

        if (signal.aborted) {
          resetState();
          toast.info("Export cancelled");
          return;
        }

        const failedCount = itemsWithImages.length - imageUrlMap.size;

        if (imageUrlMap.size === 0) {
          setExportState("error");
          toast.error(
            "All image uploads failed. Check your internet connection."
          );
          return;
        }

        const result = downloadShareableTierListAsJSON(tierList, imageUrlMap);

        if (result.success) {
          exportSucceededRef.current = true;
          setExportState("success");
          const sizeStr = formatFileSize(result.fileSizeBytes);
          if (failedCount > 0) {
            toast.success(
              `Exported! (${sizeStr}) - ${failedCount} image(s) kept as base64`
            );
          } else {
            toast.success(`Shareable export complete! (${sizeStr})`);
          }
          setTimeout(() => {
            onSuccess?.();
            resetState();
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      setExportState("error");
      toast.error("Failed to export tier list");
    } finally {
      if (!exportSucceededRef.current) {
        setUploadProgress(null);
        setCurrentImageName("");
      }
    }
  }, [tierList, exportMode, onSuccess, resetState]);

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    resetState();
  }, [resetState]);

  return {
    exportMode,
    setExportMode,
    exportState,
    uploadProgress,
    currentImageName,
    shareableEnabled,
    handleExport,
    handleSimpleExport,
    handleCancel,
    resetState,
    isExportingSimple,
  };
}
