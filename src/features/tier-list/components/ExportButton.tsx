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
import { captureElementAsPngBlob } from "../utils/capture";

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

    try {
      const theme = resolvedTheme === "dark" ? "dark" : "light";
      const blob = await captureElementAsPngBlob(targetRef.current, { theme });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Tier list exported!", { id: toastId });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      log.error("Export rendering error", error as Error);
      if (msg === "Failed to load export library") {
        toast.error("Failed to load export feature. Check your connection.", {
          id: toastId,
        });
      } else {
        toast.error(`Export failed: ${msg}. Try a smaller list.`, {
          id: toastId,
        });
      }
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
