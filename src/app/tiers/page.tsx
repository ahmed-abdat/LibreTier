"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { TierListGallery } from "@/features/tier-list/components";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function TiersPage() {
  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen flex-col bg-linear-to-b">
      {/* Header */}
      <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={40} priority />
            <span className="text-xl font-bold">LibreTier</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-8">
        <TierListGallery />
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <p className="text-muted-foreground text-center text-sm">
            LibreTier - Free, open source tier list maker. No account required.
          </p>
        </div>
      </footer>
    </div>
  );
}
