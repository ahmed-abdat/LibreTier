"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { TierListEditor } from "@/features/tier-list/components";
import { useTierStore } from "@/features/tier-list/store";
import { Button } from "@/components/ui/button";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { NotFoundPage } from "@/components/ui/not-found-card";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Optimize: selective subscriptions to prevent re-renders
  const listExists = useTierStore((state) =>
    state.tierLists.some((list) => list.id === (params.id as string))
  );
  const currentListId = useTierStore((state) => state.currentListId);
  const selectList = useTierStore((state) => state.selectList);
  const id = params.id as string;

  // Handle hydration and select the list
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- Required for SSR hydration
    if (id) {
      selectList(id);
    }
  }, [id, selectList]);

  // Ensure list is selected before rendering editor
  const isListSelected = currentListId === id;

  // Show loading state until mounted
  if (!mounted) {
    return <PageLoadingSpinner label="Loading editor..." />;
  }

  // Show not found state (check before isListSelected to avoid infinite loading)
  if (!listExists) {
    return (
      <NotFoundPage
        icon={<Logo size={64} className="opacity-50" />}
        title="Tier List Not Found"
        description="The tier list you're looking for doesn't exist or has been deleted."
        onAction={() => router.push("/")}
      />
    );
  }

  // Wait for list to be selected before rendering editor
  // This prevents race condition where tier actions fail because currentListId is null
  if (!isListSelected) {
    return <PageLoadingSpinner label="Loading editor..." />;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-12 max-w-5xl items-center justify-between px-4 md:h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-11 w-11 shrink-0 md:h-10 md:w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Logo size={40} />
              <span className="hidden font-semibold sm:inline">LibreTier</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-5xl px-2 py-4 pb-24 sm:px-4 md:pb-4">
        <TierListEditor />
      </main>
    </div>
  );
}
