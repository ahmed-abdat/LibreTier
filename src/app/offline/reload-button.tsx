"use client";

export function ReloadButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="bg-background hover:bg-accent inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
    >
      Try Again
    </button>
  );
}
