// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";
import { roboto } from "./font";
import { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
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
        className={`${roboto.variable} font-sans min-h-screen antialiased bg-background text-foreground flex flex-col`}
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
