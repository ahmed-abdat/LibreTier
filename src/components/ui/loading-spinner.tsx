import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /** Size variant: sm (4), md (8), lg (12) */
  size?: "sm" | "md" | "lg";
  /** Optional label text below spinner */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-2",
} as const;

export function LoadingSpinner({
  size = "md",
  label,
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "border-primary animate-spin rounded-full border-t-transparent",
          sizeClasses[size]
        )}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && <p className="text-muted-foreground text-sm">{label}</p>}
    </div>
  );
}

/** Full page loading spinner centered on screen */
export function PageLoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="md" label={label} />
    </div>
  );
}
