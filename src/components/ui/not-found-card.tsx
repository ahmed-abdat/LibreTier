"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface NotFoundCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function NotFoundCard({
  icon,
  title,
  description,
  actionLabel = "Go to Home",
  actionHref,
  onAction,
}: NotFoundCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 text-center"
    >
      {icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center">
          {icon}
        </div>
      )}
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground max-w-md">{description}</p>
      {(actionHref ?? onAction) && (
        <div className="pt-2">
          {actionHref ? (
            <Button asChild>
              <Link href={actionHref}>
                <Home className="mr-2 h-4 w-4" />
                {actionLabel}
              </Link>
            </Button>
          ) : (
            <Button onClick={onAction}>
              <Home className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface NotFoundPageProps extends NotFoundCardProps {
  showHeader?: boolean;
}

export function NotFoundPage({
  showHeader = true,
  ...cardProps
}: NotFoundPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && (
        <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
          <div className="container mx-auto flex h-12 max-w-6xl items-center justify-between px-4 md:h-14">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={40} />
              <h1 className="text-xl font-bold">LibreTier</h1>
            </Link>
            <ThemeToggle />
          </div>
        </header>
      )}
      <main className="flex flex-1 items-center justify-center p-4">
        <NotFoundCard {...cardProps} />
      </main>
    </div>
  );
}
