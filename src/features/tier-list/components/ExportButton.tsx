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
import html2canvas from "html2canvas";

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  hasItems?: boolean;
}

export function ExportButton({
  targetRef,
  filename = "tier-list",
  hasItems = false,
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

    try {
      // Small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get background color based on theme
      const backgroundColor = resolvedTheme === "dark" ? "#0a0a0f" : "#ffffff";

      const canvas = await html2canvas(targetRef.current, {
        backgroundColor,
        scale: 2, // Higher quality
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
          const dragHandles = clonedDoc.body.querySelectorAll(
            "[data-drag-handle]"
          );
          dragHandles.forEach((handle) => {
            (handle as HTMLElement).style.display = "none";
          });
          // Hide edit buttons during export
          const editButtons = clonedDoc.body.querySelectorAll(
            "[data-edit-button]"
          );
          editButtons.forEach((btn) => {
            (btn as HTMLElement).style.display = "none";
          });
        },
      });

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error("Failed to generate image", { id: toastId });
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
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export tier list", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }, [targetRef, filename, hasItems, resolvedTheme]);

  const isDisabled = isExporting || !hasItems;

  const button = (
    <Button
      onClick={handleExport}
      disabled={isDisabled}
      variant="outline"
      className={`h-10 sm:h-9 px-3 sm:px-4 ${!hasItems ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline ml-2">Exporting...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Export as Image</span>
        </>
      )}
    </Button>
  );

  // Show tooltip when disabled due to no items
  if (!hasItems && !isExporting) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>{button}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add items to your tier list to export</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
