"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Share2,
  Link2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import type { TierList } from "../index";
import {
  createShareableUrl,
  canShareViaUrl,
  type ShareProgress,
  type ShareResult,
  type ShareabilityResult,
} from "../utils/url-share";
import { useSettingsStore } from "../store/settings-store";

interface ShareDialogProps {
  tierList: TierList | null;
  isMobile?: boolean;
}

type ShareState = "idle" | "creating" | "success" | "error";

export function ShareDialog({ tierList, isMobile = false }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [progress, setProgress] = useState<ShareProgress | null>(null);
  const [copied, setCopied] = useState(false);

  // Get custom API key from settings
  const customApiKey = useSettingsStore(
    (state) => state.settings.imgbbApiKey || undefined
  );

  // Check if sharing is possible with detailed breakdown
  const shareability: ShareabilityResult | null = useMemo(() => {
    if (!tierList) return null;
    return canShareViaUrl(tierList);
  }, [tierList]);

  const handleShare = useCallback(() => {
    if (!tierList) return;

    setShareState("creating");
    setShareResult(null);
    setProgress({ status: "idle", message: "Starting..." });

    void createShareableUrl(tierList, {
      onProgress: (p) => setProgress(p),
      customApiKey,
    }).then((result) => {
      if (result.success) {
        setShareState("success");
        setShareResult(result);
      } else {
        setShareState("error");
        setShareResult(result);
      }
    });
  }, [tierList, customApiKey]);

  const handleCopy = useCallback(() => {
    const url = shareResult?.url;
    if (!url) return;

    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    );
  }, [shareResult]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // Reset state when closing
      setShareState("idle");
      setShareResult(null);
      setProgress(null);
      setCopied(false);
    }
    setIsOpen(open);
  }, []);

  const hasContent = tierList !== null;
  const isDisabled = !hasContent;

  const progressPercent =
    progress?.current && progress.total
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  const triggerButton = (
    <Button
      disabled={isDisabled}
      variant="outline"
      aria-label="Share tier list via link"
      className={`${isMobile ? "h-11 min-w-[44px] px-4" : "h-10 px-3 sm:h-9 sm:px-4"} ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      <span className={`ml-2 ${isMobile ? "" : "hidden sm:inline"}`}>
        Share
      </span>
    </Button>
  );

  if (isDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
        <TooltipContent>
          <p>No tier list to share</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share via link</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Tier List
          </DialogTitle>
          <DialogDescription>
            Create a shareable link that anyone can open to view your tier list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Idle State - Show info and create button */}
          {shareState === "idle" && shareability && (
            <>
              {/* Capacity indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">URL Capacity</span>
                  <span
                    className={
                      shareability.capacityPercent > 100
                        ? "font-medium text-red-500"
                        : shareability.capacityPercent > 80
                          ? "font-medium text-yellow-500"
                          : "text-muted-foreground"
                    }
                  >
                    {shareability.capacityPercent}%
                  </span>
                </div>
                <Progress
                  value={Math.min(shareability.capacityPercent, 100)}
                  className={`h-2 ${
                    shareability.capacityPercent > 100
                      ? "[&>div]:bg-red-500"
                      : shareability.capacityPercent > 80
                        ? "[&>div]:bg-yellow-500"
                        : ""
                  }`}
                />
              </div>

              {/* Breakdown info */}
              <div className="bg-muted/50 space-y-2 rounded-lg p-3">
                <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span>Total items:</span>
                  <span className="text-foreground font-medium">
                    {shareability.breakdown.totalItems}
                  </span>
                  {shareability.breakdown.itemsWithImages > 0 && (
                    <>
                      <span>With images:</span>
                      <span className="text-foreground font-medium">
                        {shareability.breakdown.itemsWithImages} (will upload)
                      </span>
                    </>
                  )}
                  {shareability.breakdown.textOnlyItems > 0 && (
                    <>
                      <span>Text only:</span>
                      <span className="text-foreground font-medium">
                        {shareability.breakdown.textOnlyItems}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Warning if approaching/exceeding limit */}
              {shareability.warning && (
                <div
                  className={`flex items-start gap-2 rounded-lg border p-3 ${
                    shareability.canShare
                      ? "border-yellow-500/20 bg-yellow-500/10"
                      : "border-red-500/20 bg-red-500/10"
                  }`}
                >
                  <AlertCircle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      shareability.canShare ? "text-yellow-500" : "text-red-500"
                    }`}
                  />
                  <div className="text-sm">
                    <p className="font-medium">{shareability.warning}</p>
                    {shareability.suggestions &&
                      shareability.suggestions.length > 0 && (
                        <ul className="text-muted-foreground mt-1 list-inside list-disc">
                          {shareability.suggestions.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              )}

              {/* Action button */}
              {shareability.canShare ? (
                <Button onClick={handleShare} className="w-full">
                  <Link2 className="mr-2 h-4 w-4" />
                  Create Share Link
                </Button>
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  Use <strong>Export → Backup JSON</strong> to share large tier
                  lists
                </p>
              )}
            </>
          )}

          {/* Creating State - Show progress */}
          {shareState === "creating" && progress && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">{progress.message}</span>
              </div>

              {progress.status === "uploading" && progress.total && (
                <div className="space-y-2">
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-muted-foreground text-center text-xs">
                    {progress.current} of {progress.total} images uploaded
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success State - Show URL and copy button */}
          {shareState === "success" && shareResult?.url && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Share link created!</span>
              </div>

              <div className="flex gap-2">
                <Input
                  value={shareResult.url}
                  readOnly
                  className="font-mono text-xs"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopy} className="flex-1">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(shareResult.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-muted-foreground text-center text-xs">
                URL length: {shareResult.urlLength?.toLocaleString()} characters
              </p>
            </div>
          )}

          {/* Error State */}
          {shareState === "error" && shareResult && (
            <div className="space-y-3">
              <div className="bg-destructive/10 flex items-start gap-2 rounded-lg border border-red-500/20 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div className="text-sm">
                  <p className="font-medium">Failed to create share link</p>
                  <p className="text-muted-foreground">{shareResult.error}</p>
                </div>
              </div>

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
