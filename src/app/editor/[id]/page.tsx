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

  const { tierLists, selectList } = useTierStore();
  const id = params.id as string;

  // Handle hydration and select the list
  useEffect(() => {
    setMounted(true);
    if (id) {
      selectList(id);
    }
  }, [id, selectList]);

  // Check if list exists after mounting
  const listExists = tierLists.some((list) => list.id === id);

  // Show loading state
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!listExists) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={40} />
              <h1 className="text-xl font-bold">Tier List</h1>
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
            <p className="max-w-md text-muted-foreground">
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

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Logo size={40} />
              <span className="hidden font-semibold sm:inline">Tier List</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-5xl p-4">
        <TierListEditor />
      </main>
    </div>
  );
}
