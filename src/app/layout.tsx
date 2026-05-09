// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallPrompt, OfflineIndicator } from "@/features/pwa";
import { Toaster } from "sonner";
import "./globals.css";
import { roboto } from "./font";
import { SITE_URL } from "@/lib/constants";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Free Tier List Maker - No Login Required | LibreTier",
  description:
    "Create and share tier lists instantly. No account needed. Works offline. Upload images, drag to rank, export as PNG. Free, open source, privacy-first tier list creator.",
  keywords: [
    "tier list maker",
    "free tier list maker",
    "tier list creator",
    "ranking maker",
    "tier list no login",
    "open source tier list",
    "offline tier list",
    "tiermaker alternative",
  ],
  authors: [{ name: "LibreTier" }],
  creator: "LibreTier",
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
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "LibreTier",
    title: "Free Tier List Maker - No Login Required | LibreTier",
    description:
      "Create and share tier lists instantly. No account needed. Works offline. Upload images, drag to rank, export as PNG. Free, open source, privacy-first.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Tier List Maker - No Login Required | LibreTier",
    description:
      "Create and share tier lists instantly. No account needed. Works offline. Free, open source, privacy-first tier list creator.",
    creator: "@libretier",
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LibreTier",
  description:
    "Free, open-source tier list maker. Create and share tier lists instantly with no account required.",
  url: SITE_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "No login required",
    "Works offline (PWA)",
    "Drag and drop interface",
    "Export as PNG",
    "URL sharing",
    "Undo/Redo support",
    "Open source",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
        <OfflineIndicator />
        <InstallPrompt />
      </body>
    </html>
  );
}
