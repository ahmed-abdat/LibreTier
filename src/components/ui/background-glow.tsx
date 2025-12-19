"use client";

import { cn } from "@/lib/utils";

interface BackgroundGlowProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "warm" | "cool" | "tier";
}

export function BackgroundGlow({
  className,
  children,
  variant = "tier",
}: BackgroundGlowProps) {
  const glowStyles = {
    primary: {
      light:
        "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
      dark: "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
    },
    warm: {
      light:
        "radial-gradient(ellipse 60% 40% at 50% 20%, #FFF991 0%, transparent 60%)",
      dark: "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255, 249, 145, 0.15) 0%, transparent 60%)",
    },
    cool: {
      light:
        "radial-gradient(ellipse 60% 40% at 50% 20%, #91D5FF 0%, transparent 60%)",
      dark: "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(145, 213, 255, 0.15) 0%, transparent 60%)",
    },
    tier: {
      light: `
        radial-gradient(ellipse 40% 30% at 25% 20%, rgba(255, 127, 127, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse 40% 30% at 75% 25%, rgba(255, 191, 127, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse 50% 35% at 50% 60%, rgba(127, 255, 127, 0.15) 0%, transparent 50%)
      `,
      dark: `
        radial-gradient(ellipse 40% 30% at 25% 20%, rgba(255, 127, 127, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse 40% 30% at 75% 25%, rgba(255, 191, 127, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse 50% 35% at 50% 60%, rgba(127, 255, 127, 0.06) 0%, transparent 50%)
      `,
    },
  };

  return (
    <div className={cn("relative min-h-screen w-full", className)}>
      {/* Light mode glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 dark:opacity-0"
        style={{
          backgroundImage: glowStyles[variant].light,
          opacity: 0.6,
        }}
      />
      {/* Dark mode glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 dark:opacity-100"
        style={{
          backgroundImage: glowStyles[variant].dark,
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
