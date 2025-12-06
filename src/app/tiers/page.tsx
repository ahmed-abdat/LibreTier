"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { TierListGallery } from "@/features/tier-list/components";
import { Layers } from "lucide-react";
import Link from "next/link";

export default function TiersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">Tier Maker</span>
              <span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">Rank anything beautifully</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <TierListGallery />
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Create beautiful tier lists. No account required.
          </p>
        </div>
      </footer>
    </div>
  );
}
