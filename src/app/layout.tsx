// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";
import { roboto } from "./font";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://libretier.vercel.app"),
  title: "LibreTier - Free Open Source Tier List Maker",
  description:
    "LibreTier is a free, open-source tier list maker. Rank anything with customizable tiers, drag-and-drop, and export to share.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LibreTier",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "LibreTier - Free Open Source Tier List Maker",
    description:
      "LibreTier is a free, open-source tier list maker. Rank anything with customizable tiers, drag-and-drop, and export to share.",
    images: ["/tier_list_logo.png"],
  },
  twitter: {
    card: "summary",
    title: "LibreTier - Free Open Source Tier List Maker",
    description:
      "LibreTier is a free, open-source tier list maker. Rank anything with customizable tiers, drag-and-drop, and export to share.",
    images: ["/tier_list_logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        suppressHydrationWarning
        className={`${roboto.variable} bg-background text-foreground flex min-h-screen flex-col font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <div className="flex-1">{children}</div>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster position="top-center" duration={2000} richColors />
      </body>
    </html>
  );
}
