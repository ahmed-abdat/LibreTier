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
import { logger } from "@/lib/logger";

const log = logger.child("ExportButton");

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
      // Dynamic import html2canvas-pro (supports oklch colors from Tailwind v4)
      const html2canvasModule = await import("html2canvas-pro");
      html2canvas = html2canvasModule.default;
    } catch (importError) {
      log.error("Failed to load export library", importError as Error);
      toast.error("Failed to load export feature. Check your connection.", {
        id: toastId,
      });
      setIsExporting(false);
      return;
    }

    try {
      // Pre-load all images before capture to ensure they're rendered
      const preloadImages = async (container: HTMLElement) => {
        const images = container.querySelectorAll("img");
        const promises = Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if image fails
          });
        });
        await Promise.all(promises);
      };

      await preloadImages(targetRef.current);

      // Small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get background color based on theme
      const backgroundColor = resolvedTheme === "dark" ? "#0a0a0f" : "#ffffff";

      const canvas = await html2canvas(targetRef.current, {
        backgroundColor,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 30000, // Increase timeout for base64 images
        // Set window dimensions for consistent capture
        windowWidth: targetRef.current.scrollWidth,
        windowHeight: targetRef.current.scrollHeight,
        // Reset scroll position
        scrollX: 0,
        scrollY: -window.scrollY,
        removeContainer: true,
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

          // Enhance item visibility for export
          const exportTarget = clonedDoc.body.querySelector(
            "[data-export-target]"
          );
          if (exportTarget) {
            // Hide all delete buttons on items
            const deleteButtons = exportTarget.querySelectorAll(
              "[data-tier-item] button"
            );
            deleteButtons.forEach((btn) => {
              (btn as HTMLElement).style.display = "none";
            });

            // Hide tier settings buttons (gear icons on tier labels)
            const settingsButtons = exportTarget.querySelectorAll(
              "button[aria-label*='Settings']"
            );
            settingsButtons.forEach((btn) => {
              (btn as HTMLElement).style.display = "none";
            });

            // Also hide any buttons with Settings2 icon class pattern
            const allTierButtons = exportTarget.querySelectorAll(
              ".absolute.rounded-full"
            );
            allTierButtons.forEach((btn) => {
              (btn as HTMLElement).style.display = "none";
            });

            // Find all tier items and enhance their visibility
            const tierItems = exportTarget.querySelectorAll("[data-tier-item]");
            tierItems.forEach((item) => {
              const el = item as HTMLElement;
              // Find the inner container (direct child div)
              const innerContainer = el.querySelector(
                ":scope > div"
              ) as HTMLElement | null;
              if (innerContainer) {
                // Add strong visible border and shadow for contrast
                // Light mode needs stronger borders for visibility
                innerContainer.style.border = isDark
                  ? "2px solid rgba(255, 255, 255, 0.4)"
                  : "2px solid rgba(0, 0, 0, 0.25)";
                innerContainer.style.boxShadow = isDark
                  ? "0 4px 16px rgba(0, 0, 0, 0.7)"
                  : "0 2px 10px rgba(0, 0, 0, 0.2)";
                innerContainer.style.borderRadius = "8px";
                innerContainer.style.overflow = "hidden";

                // Check if it's a text-only item (no image)
                const img = innerContainer.querySelector("img");
                if (img) {
                  // Image item - ensure solid background and full opacity
                  innerContainer.style.backgroundColor = isDark
                    ? "#1a1a1f"
                    : "#ffffff";
                  // Force full opacity and remove any filters
                  img.style.opacity = "1";
                  img.style.filter = "none";
                  img.style.objectFit = "cover";
                  img.style.width = "100%";
                  img.style.height = "100%";
                  // Ensure image is not transparent
                  img.style.mixBlendMode = "normal";
                  // Add slight contrast boost for light mode
                  if (!isDark) {
                    img.style.filter = "contrast(1.05) saturate(1.05)";
                  }
                } else {
                  // Text-only item - needs better contrast
                  const textFallback = innerContainer.querySelector(
                    "div"
                  ) as HTMLElement | null;
                  if (textFallback) {
                    textFallback.style.backgroundColor = isDark
                      ? "#2a2a35"
                      : "#f5f5f5";
                    textFallback.style.color = isDark ? "#ffffff" : "#1a1a1a";
                    textFallback.style.fontWeight = "600";
                  }
                }
              }
            });

            // Enhance tier row content backgrounds for better item visibility
            const tierContents =
              exportTarget.querySelectorAll(".grid.min-h-20");
            tierContents.forEach((tier) => {
              const el = tier as HTMLElement;
              el.style.backgroundColor = isDark
                ? "rgba(255, 255, 255, 0.06)"
                : "rgba(0, 0, 0, 0.04)";
            });
          }
        },
      });

      // Validate canvas was generated successfully
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas generation failed - empty result");
      }

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
      const msg = error instanceof Error ? error.message : "Unknown error";
      log.error("Export rendering error", error as Error);
      toast.error(`Export failed: ${msg}. Try a smaller list.`, {
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
            Saving...
          </span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className={`ml-2 ${isMobile ? "" : "hidden sm:inline"}`}>
            Save Image
          </span>
        </>
      )}
    </Button>
  );

  // Always show tooltip with different messages
  const tooltipMessage =
    !hasItems && !isExporting
      ? "Add items to save as image"
      : "Save as PNG image";

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
