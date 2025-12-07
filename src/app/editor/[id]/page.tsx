"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import Image from "next/image";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!listExists) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-6xl flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/tier_list_logo.png"
                alt="Tier List Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold">Tier List</h1>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              <Image
                src="/tier_list_logo.png"
                alt="Tier List Logo"
                width={64}
                height={64}
                className="rounded-lg opacity-50"
              />
            </div>
            <h2 className="text-2xl font-bold">Tier List Not Found</h2>
            <p className="text-muted-foreground max-w-md">
              The tier list you&apos;re looking for doesn&apos;t exist or has been deleted.
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
        <div className="container mx-auto max-w-5xl flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/tiers")}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/tier_list_logo.png"
                alt="Tier List Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-semibold hidden sm:inline">Tier List</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 max-w-5xl">
        <TierListEditor />
      </main>
    </div>
  );
}
