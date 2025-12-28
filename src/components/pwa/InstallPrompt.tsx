"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
const DISMISSED_EXPIRY_DAYS = 1;

// iOS Safari share icon
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25"
      />
    </svg>
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const isDismissed = useCallback(() => {
    if (typeof window === "undefined") return true;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) return false;
    const dismissedAt = parseInt(dismissed, 10);
    const expiryTime = DISMISSED_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt < expiryTime;
  }, []);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    if (standalone) return;

    const ua = navigator.userAgent;
    const iOS =
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);

    setIsIOS(iOS);
    setIsIOSSafari(iOS && isSafari);

    // iOS Safari: show manual instructions
    if (iOS && isSafari && !isDismissed()) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // iOS non-Safari: don't show (can't install)
    if (iOS && !isSafari) return;

    // Other browsers: listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed()) {
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

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

  if (isStandalone || !showBanner) {
    return null;
  }

  // iOS Safari: manual install instructions
  if (isIOSSafari) {
    return (
      <div
        className={cn(
          "animate-in slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50 duration-300",
          "bg-background/95 supports-backdrop-filter:bg-background/80 border-t backdrop-blur-md"
        )}
      >
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
              <Image
                src="/icons/icon-192.png"
                alt="LibreTier"
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold">Install LibreTier</h3>
              <p className="text-muted-foreground text-xs">
                Add to home screen for offline access
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Tap</span>
                <span className="bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5">
                  <ShareIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-muted-foreground">then</span>
                <span className="bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add to Home</span>
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // iOS non-Safari: can't install, don't show
  if (isIOS) {
    return null;
  }

  // Standard install prompt (Chrome, Edge, etc.)
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
      <div className="mx-auto max-w-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
            <Image
              src="/icons/icon-192.png"
              alt="LibreTier"
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold">Install LibreTier</h3>
            <p className="text-muted-foreground text-xs">
              Quick access & offline support
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 px-3 text-xs"
            >
              Later
            </Button>
            <Button
              size="sm"
              onClick={() => void handleInstall()}
              disabled={isInstalling}
              className="h-8 px-3 text-xs"
            >
              {isInstalling ? "..." : "Install"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
