"use client";

import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  hasItems?: boolean;
  isMobile?: boolean;
}

export function ExportButton({
  targetRef,
  filename = "tier-list",
  hasItems = false,
  isMobile = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleExport = useCallback(async () => {
    if (!targetRef.current) {
      toast.error("Nothing to export");
      return;
    }

    if (!hasItems) {
      toast.error("Add some items to your tier list first");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Generating image...");

    let html2canvas;
    try {
      // Dynamic import html2canvas (4.1MB) - only load when user exports
      const module = await import("html2canvas");
      html2canvas = module.default;
    } catch (importError) {
      console.error("Failed to load export library:", importError);
      toast.error("Failed to load export feature. Check your connection.", {
        id: toastId,
      });
      setIsExporting(false);
      return;
    }

    try {
      // Small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get background color based on theme
      const backgroundColor = resolvedTheme === "dark" ? "#0a0a0f" : "#ffffff";

      const canvas = await html2canvas(targetRef.current, {
        backgroundColor,
        scale: 2,
        useCORS: true,
        logging: false,
        // Ensure all images are loaded
        onclone: (clonedDoc) => {
          // Ensure theme is applied to cloned document
          const isDark = resolvedTheme === "dark";
          clonedDoc.documentElement.classList.toggle("dark", isDark);
          clonedDoc.documentElement.classList.toggle("light", !isDark);
          clonedDoc.documentElement.style.colorScheme = isDark
            ? "dark"
            : "light";

          // Make sure cloned element is visible
          const clonedElement = clonedDoc.body.querySelector(
            "[data-export-target]"
          );
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = "none";
          }
          // Hide drag handles during export
          const dragHandles =
            clonedDoc.body.querySelectorAll("[data-drag-handle]");
          dragHandles.forEach((handle) => {
            (handle as HTMLElement).style.display = "none";
          });
          // Hide edit buttons during export
          const editButtons =
            clonedDoc.body.querySelectorAll("[data-edit-button]");
          editButtons.forEach((btn) => {
            (btn as HTMLElement).style.display = "none";
          });
          // Hide elements marked for export exclusion (e.g., Add Tier button)
          const hideElements =
            clonedDoc.body.querySelectorAll("[data-hide-export]");
          hideElements.forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
          // Show the title that's hidden in editor
          const exportTitle = clonedDoc.body.querySelector(
            "[data-export-title]"
          );
          if (exportTitle) {
            (exportTitle as HTMLElement).style.display = "block";
          }
        },
      });

      // Convert to blob and download with timeout protection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Image generation timed out"));
        }, 10000);

        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout);
            if (!blob) {
              reject(new Error("Failed to generate image blob"));
              return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Tier list exported!", { id: toastId });
            resolve();
          },
          "image/png",
          1.0
        );
      });
    } catch (error) {
      console.error("Export rendering error:", error);
      toast.error("Failed to render tier list. Try a smaller list.", {
        id: toastId,
      });
    } finally {
      setIsExporting(false);
    }
  }, [targetRef, filename, hasItems, resolvedTheme]);

  const isDisabled = isExporting || !hasItems;

  const button = (
    <Button
      onClick={() => void handleExport()}
      disabled={isDisabled}
      variant="outline"
      aria-busy={isExporting}
      aria-label={
        isExporting ? "Exporting tier list" : "Export tier list as image"
      }
      className={`${isMobile ? "h-11 min-w-[44px] px-4" : "h-10 px-3 sm:h-9 sm:px-4"} ${!hasItems ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className={`ml-2 ${isMobile ? "" : "hidden sm:inline"}`}>
            Exporting...
          </span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className={`ml-2 ${isMobile ? "" : "hidden sm:inline"}`}>
            Export
          </span>
        </>
      )}
    </Button>
  );

  // Always show tooltip with different messages
  const tooltipMessage =
    !hasItems && !isExporting
      ? "Add items to your tier list to export"
      : "Export tier list as PNG image";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {!hasItems && !isExporting ? (
          <span role="presentation">{button}</span>
        ) : (
          button
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipMessage}</p>
      </TooltipContent>
    </Tooltip>
  );
}
