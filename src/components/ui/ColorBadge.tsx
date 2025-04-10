import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
interface ColorBadgeProps {
  color: string;
  size?: "sm" | "md" | "lg";
  showInBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function ColorBadge({
  color,
  size = "md",
  className,
  showInBadge = true,
}: ColorBadgeProps) {
  const ColorSwatch = (
    <div className="flex items-center">
      <div
        className={`${sizeClasses[size]} rounded-full border border-border/50 shadow-sm`}
        style={{ backgroundColor: color }}
      />
    </div>
  );

  if (!showInBadge) {
    return ColorSwatch;
  }

  return (
    <Badge variant="secondary" className={cn("h-7 px-2 py-0", className)}>
      {ColorSwatch}
    </Badge>
  );
}
