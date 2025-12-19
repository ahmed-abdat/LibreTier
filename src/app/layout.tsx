// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";
import { roboto } from "./font";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://tier-maker-nine.vercel.app"),
  title: "Tier List - Create Beautiful Tier Lists",
  description:
    "Rank anything with customizable tier lists. Upload images, drag to organize, and export to share with friends.",
  icons: {
    icon: "/favicon.ico",
    apple: "/tier_list_logo.png",
  },
  openGraph: {
    title: "Tier List - Create Beautiful Tier Lists",
    description:
      "Rank anything with customizable tier lists. Upload images, drag to organize, and export to share with friends.",
    images: ["/tier_list_logo.png"],
  },
  twitter: {
    card: "summary",
    title: "Tier List - Create Beautiful Tier Lists",
    description:
      "Rank anything with customizable tier lists. Upload images, drag to organize, and export to share with friends.",
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
        className={`${roboto.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
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
