"use client";

import type { JSX } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getContrastColor } from "@/lib/utils";
import { copyToClipboard } from "@/lib/clipboard";
import type { TierList, TierRow, TierItem } from "@/features/tier-list";

// Read-only tier item component
function SharedTierItem({ item }: { item: TierItem }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <div className="hover:border-primary/40 relative h-[72px] w-[72px] overflow-hidden rounded-lg border-2 border-transparent shadow-sm transition-all hover:shadow-md">
          {item.imageUrl && !imageError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="bg-secondary text-secondary-foreground flex h-full w-full items-center justify-center p-1.5 text-center text-[10px] leading-tight font-medium">
              <span className="line-clamp-3">{item.name}</span>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[180px] px-3 py-2">
        <p className="text-sm leading-tight font-medium">{item.name}</p>
        {item.description && (
          <p className="text-muted-foreground mt-1 text-xs leading-snug">
            {item.description}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// Read-only tier row component
function SharedTierRow({ row }: { row: TierRow }) {
  const textColor = getContrastColor(row.color);

  return (
    <div className="border-border flex border-b last:border-b-0">
      {/* Tier Label */}
      <div
        className="flex w-20 min-w-20 shrink-0 items-center justify-center font-bold sm:w-24 sm:min-w-24"
        style={{ backgroundColor: row.color }}
      >
        <span
          className="block w-full p-1 text-center font-bold drop-shadow-xs"
          style={{
            color: textColor,
            fontSize: "14px",
            lineHeight: "1.2",
            wordBreak: "break-word",
          }}
        >
          {row.name ?? row.level}
        </span>
      </div>

      {/* Tier Content */}
      <div className="bg-muted/20 grid min-h-20 flex-1 grid-cols-[repeat(auto-fill,72px)] content-start items-start gap-1.5 p-1.5 sm:gap-2 sm:p-2">
        {row.items.map((item) => (
          <SharedTierItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export interface SharedTierViewProps {
  tierList: TierList;
  /** Called when user clicks "Clone to My Lists". Receives the tier list to import. */
  onClone: (tierList: TierList) => void;
  /** Called when user clicks "Copy Link". Receives the URL to copy (defaults to window.location.href if omitted). */
  copyUrl?: string;
}

export function SharedTierView({
  tierList,
  onClone,
  copyUrl,
}: SharedTierViewProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const itemCount =
    tierList.rows.reduce((acc, row) => acc + row.items.length, 0) +
    tierList.unassignedItems.length;

  const handleCopyLink = () => {
    const url = copyUrl ?? window.location.href;
    void copyToClipboard(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClone = () => {
    onClone(tierList);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Title and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Shared
            </span>
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">{tierList.title}</h1>
          <p className="text-muted-foreground text-sm">
            {tierList.rows.length} tiers &middot; {itemCount} items
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button size="sm" onClick={handleClone} className="gap-2">
            <Plus className="h-4 w-4" />
            Clone to My Lists
          </Button>
        </div>
      </div>

      {/* Tier List */}
      <div className="border-border overflow-hidden rounded-lg border">
        {tierList.rows.map((row) => (
          <SharedTierRow key={row.id} row={row} />
        ))}
      </div>

      {/* Unassigned Items */}
      {tierList.unassignedItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm font-medium">
            Unranked Items ({tierList.unassignedItems.length})
          </h3>
          <div className="border-border bg-muted/20 grid grid-cols-[repeat(auto-fill,72px)] gap-1.5 rounded-lg border p-2 sm:gap-2 sm:p-3">
            {tierList.unassignedItems.map((item) => (
              <SharedTierItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="border-border bg-muted/30 rounded-lg border p-3 text-center sm:p-4">
        <p className="text-muted-foreground mb-2 text-sm">
          Want to create your own tier list?
        </p>
        <Button asChild variant="outline">
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            Create New Tier List
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
