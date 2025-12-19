"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { HeroSection } from "@/components/landing/HeroSection";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function Home() {
  return (
    <BackgroundGlow variant="tier" className="bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={40} priority />
            <span className="text-xl font-bold">Tier List</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/tiers">My Tier Lists</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Landing Hero */}
      <main className="container mx-auto max-w-6xl px-4">
        <HeroSection />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Create beautiful tier lists. No account required.
          </p>
        </div>
      </footer>
    </BackgroundGlow>
  );
}
