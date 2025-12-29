"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Check, Plus, Home, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { parseShareUrl } from "@/features/tier-list/utils/url-share";
import { useTierStore } from "@/features/tier-list/store";
import { getContrastColor } from "@/lib/utils";
import type { TierList, TierRow, TierItem } from "@/features/tier-list";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Read-only tier item component
function SharedTierItem({ item }: { item: TierItem }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <div className="hover:border-primary/40 relative h-[72px] w-[72px] overflow-hidden rounded-lg border-2 border-transparent shadow-sm transition-all hover:shadow-md">
          {item.imageUrl && !imageError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="bg-secondary text-secondary-foreground flex h-full w-full items-center justify-center p-1.5 text-center text-[10px] leading-tight font-medium">
              <span className="line-clamp-3">{item.name}</span>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[180px] px-3 py-2">
        <p className="text-sm leading-tight font-medium">{item.name}</p>
        {item.description && (
          <p className="text-muted-foreground mt-1 text-xs leading-snug">
            {item.description}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// Read-only tier row component
function SharedTierRow({ row }: { row: TierRow }) {
  const textColor = getContrastColor(row.color);

  return (
    <div className="border-border flex border-b last:border-b-0">
      {/* Tier Label */}
      <div
        className="flex w-24 min-w-24 shrink-0 items-center justify-center font-bold"
        style={{ backgroundColor: row.color }}
      >
        <span
          className="block w-full p-1 text-center font-bold drop-shadow-xs"
          style={{
            color: textColor,
            fontSize: "14px",
            lineHeight: "1.2",
            wordBreak: "break-word",
          }}
        >
          {row.name ?? row.level}
        </span>
      </div>

      {/* Tier Content */}
      <div className="bg-muted/20 grid min-h-20 flex-1 grid-cols-[repeat(auto-fill,72px)] content-start items-start gap-2 p-2">
        {row.items.map((item) => (
          <SharedTierItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function SharePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sharedList, setSharedList] = useState<TierList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const importList = useTierStore((state) => state.importList);

  // Parse URL hash on mount
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- Required for SSR hydration

    if (typeof window === "undefined") return;

    const hash = window.location.hash.slice(1); // Remove # prefix
    if (!hash) {
      setError("No tier list data found in URL");
      return;
    }

    const parsed = parseShareUrl(hash);
    if (!parsed) {
      setError("Invalid or corrupted share link");
      return;
    }

    setSharedList(parsed);
  }, []);

  // Copy current URL to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    );
  };

  // Clone to user's tier lists
  const handleClone = () => {
    if (!sharedList) return;

    // Create a new list with fresh IDs - importList returns the new list ID
    const newListId = importList({
      ...sharedList,
      title: `${sharedList.title} (Copy)`,
    });

    if (newListId) {
      router.push(`/editor/${newListId}`);
    }
  };

  // Count total items
  const itemCount = useMemo(() => {
    if (!sharedList) return 0;
    return (
      sharedList.rows.reduce((acc, row) => acc + row.items.length, 0) +
      sharedList.unassignedItems.length
    );
  }, [sharedList]);

  // Loading state
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground">Loading shared tier list...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
          <div className="container mx-auto flex h-12 max-w-6xl items-center justify-between px-4 md:h-14">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={40} />
              <h1 className="text-xl font-bold">LibreTier</h1>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-center"
          >
            <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <AlertCircle className="text-destructive h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Invalid Share Link</h2>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // No data state
  if (!sharedList) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-12 max-w-6xl items-center justify-between px-4 md:h-14">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={40} />
            <h1 className="text-xl font-bold">LibreTier</h1>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Title and Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                    Shared
                  </span>
                </div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  {sharedList.title}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {sharedList.rows.length} tiers &middot; {itemCount} items
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button size="sm" onClick={handleClone} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Clone to My Lists
                </Button>
              </div>
            </div>

            {/* Tier List */}
            <div className="border-border overflow-hidden rounded-lg border">
              {sharedList.rows.map((row) => (
                <SharedTierRow key={row.id} row={row} />
              ))}
            </div>

            {/* Unassigned Items */}
            {sharedList.unassignedItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">
                  Unranked Items ({sharedList.unassignedItems.length})
                </h3>
                <div className="border-border bg-muted/20 grid grid-cols-[repeat(auto-fill,72px)] gap-2 rounded-lg border p-3">
                  {sharedList.unassignedItems.map((item) => (
                    <SharedTierItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer CTA */}
            <div className="border-border bg-muted/30 rounded-lg border p-4 text-center">
              <p className="text-muted-foreground mb-2 text-sm">
                Want to create your own tier list?
              </p>
              <Button asChild variant="outline">
                <Link href="/">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Tier List
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
