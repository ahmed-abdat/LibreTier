"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { HeroSection } from "@/components/landing/HeroSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function Home() {
  return (
    <BackgroundGlow variant="tier" className="bg-background">
      {/* Header */}
      <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={40} priority />
            <span className="text-xl font-bold">LibreTier</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/tiers">My Tier Lists</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className="container mx-auto max-w-6xl px-4">
          <HeroSection />
        </div>

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <p className="text-muted-foreground text-center text-sm">
            LibreTier - Free, open source tier list maker. No account required.
          </p>
        </div>
      </footer>
    </BackgroundGlow>
  );
}
