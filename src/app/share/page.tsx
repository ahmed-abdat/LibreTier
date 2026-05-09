"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { NotFoundPage } from "@/components/ui/not-found-card";
import { parseShareUrl } from "@/features/tier-list/utils/url-share";
import { useTierStore } from "@/features/tier-list/store";
import type { TierList } from "@/features/tier-list";
import { SharedTierView } from "./_components/shared-tier-view";

export default function SharePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sharedList, setSharedList] = useState<TierList | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Clone to user's tier lists
  const handleClone = (tierList: TierList) => {
    // Create a new list with fresh IDs - importList returns the new list ID
    const newListId = importList({
      ...tierList,
      title: `${tierList.title} (Copy)`,
    });

    if (newListId) {
      router.push(`/editor/${newListId}`);
    }
  };

  // Loading state
  if (!mounted) {
    return <PageLoadingSpinner label="Loading shared tier list..." />;
  }

  // Error state
  if (error) {
    return (
      <NotFoundPage
        icon={
          <div className="bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive h-8 w-8" />
          </div>
        }
        title="Invalid Share Link"
        description={error}
        onAction={() => router.push("/")}
      />
    );
  }

  // No data state
  if (!sharedList) {
    return <PageLoadingSpinner label="Loading..." />;
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
      <main className="flex-1 px-2 py-4 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          <SharedTierView tierList={sharedList} onClone={handleClone} />
        </div>
      </main>
    </div>
  );
}
