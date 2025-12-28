"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { TierListEditor } from "@/features/tier-list/components";
import { useTierStore } from "@/features/tier-list/store";
import { Button } from "@/components/ui/button";

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Show not found state (check before isListSelected to avoid infinite loading)
  if (!listExists) {
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <Logo size={64} className="opacity-50" />
            </div>
            <h2 className="text-2xl font-bold">Tier List Not Found</h2>
            <p className="text-muted-foreground max-w-md">
              The tier list you&apos;re looking for doesn&apos;t exist or has
              been deleted.
            </p>
            <Button onClick={() => router.push("/")} className="mt-4">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Wait for list to be selected before rendering editor
  // This prevents race condition where tier actions fail because currentListId is null
  if (!isListSelected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
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
