import { WifiOff, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { ReloadButton } from "./reload-button";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-4">
            <WifiOff className="text-muted-foreground h-12 w-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            You&apos;re Offline
          </h1>
          <p className="text-muted-foreground">
            No internet connection detected, but don&apos;t worry — LibreTier
            works offline!
          </p>
        </div>

        <div className="bg-card space-y-3 rounded-lg border p-4 text-left">
          <h2 className="font-semibold">What works offline:</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Creating and editing tier lists
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Viewing your saved tier lists
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Drag and drop items between tiers
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Exporting as PNG image
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              JSON backup export
            </li>
          </ul>
        </div>

        <div className="border-destructive/20 bg-destructive/5 space-y-3 rounded-lg border p-4 text-left">
          <h2 className="text-destructive font-semibold">Requires internet:</h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <XCircle className="text-destructive/70 h-4 w-4" />
              Uploading images to share
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="text-destructive/70 h-4 w-4" />
              URL-based sharing
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="text-destructive/70 h-4 w-4" />
              Loading shared tier lists
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/tiers"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            Go to My Tier Lists
          </Link>
          <ReloadButton />
        </div>
      </div>
    </div>
  );
}
