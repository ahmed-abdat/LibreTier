import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_URL } from "@/lib/constants";
import { getShare } from "@/lib/services/share-store";
import { minimalExportToTierList } from "@/features/tier-list/utils/url-share";
import { SharedTierClient } from "../_components/shared-tier-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = await getShare(id);

  if (!entry) {
    return {
      title: "Tier list not found | LibreTier",
      robots: { index: false, follow: false },
    };
  }

  const title = entry.data.t || "Shared Tier List";
  const itemCount =
    entry.data.r.reduce((acc, row) => acc + row.i.length, 0) +
    (entry.data.u?.length ?? 0);
  const description = `${title} — a tier list with ${entry.data.r.length} tiers and ${itemCount} items, created on LibreTier.`;
  const url = `${SITE_URL}/share/${id}`;

  const images = entry.ogImageUrl
    ? [{ url: entry.ogImageUrl, width: 1200, height: 630, alt: title }]
    : undefined;

  return {
    title: `${title} | LibreTier`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "LibreTier",
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: entry.ogImageUrl ? [entry.ogImageUrl] : undefined,
    },
  };
}

export default async function SharePageById({ params }: PageProps) {
  const { id } = await params;
  const entry = await getShare(id);
  if (!entry) notFound();

  const tierList = minimalExportToTierList(entry.data);
  if (!tierList) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-12 max-w-6xl items-center justify-between px-4 md:h-14">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={40} />
            <h1 className="text-xl font-bold">LibreTier</h1>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 px-2 py-4 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          <SharedTierClient tierList={tierList} />
        </div>
      </main>
    </div>
  );
}
