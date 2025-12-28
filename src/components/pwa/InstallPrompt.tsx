"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const DISMISSED_KEY = "pwa-install-dismissed";
const DISMISSED_EXPIRY_DAYS = 7;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Check if user previously dismissed the prompt
  const isDismissed = useCallback(() => {
    if (typeof window === "undefined") return true;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) return false;
    const dismissedAt = parseInt(dismissed, 10);
    const expiryTime = DISMISSED_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt < expiryTime;
  }, []);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // For iOS, show banner after a delay if not dismissed
    if (iOS && !isDismissed()) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // For other browsers, listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed()) {
        // Show banner after user has interacted with the page
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setIsStandalone(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isDismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
        setShowBanner(false);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShowBanner(false);
  };

  // Don't render if already installed or banner shouldn't show
  if (isStandalone || !showBanner) {
    return null;
  }

  // iOS-specific install instructions
  if (isIOS) {
    return (
      <div
        className={cn(
          "animate-in slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50 duration-300",
          "bg-background/95 supports-backdrop-filter:bg-background/80 border-t backdrop-blur-md"
        )}
      >
        <div className="container mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
              <Download className="text-primary h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold">Install LibreTier</h3>
              <p className="text-muted-foreground text-sm">
                Add to your home screen for the best experience. Works offline!
              </p>
              <div className="text-muted-foreground flex items-center gap-2 pt-2 text-sm">
                <span>Tap</span>
                <span className="bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5">
                  <Share className="h-3.5 w-3.5" />
                </span>
                <span>then</span>
                <span className="bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add to Home Screen</span>
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="shrink-0"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt for Chrome, Edge, etc.
  if (!deferredPrompt) {
    return null;
  }

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50 duration-300",
        "bg-background/95 supports-backdrop-filter:bg-background/80 border-t backdrop-blur-md"
      )}
    >
      <div className="container mx-auto max-w-2xl px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <Download className="text-primary h-6 w-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold">Install LibreTier</h3>
            <p className="text-muted-foreground text-sm">
              Install the app for quick access and offline support.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Not now
            </Button>
            <Button
              size="sm"
              onClick={() => void handleInstall()}
              disabled={isInstalling}
            >
              {isInstalling ? "Installing..." : "Install"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
