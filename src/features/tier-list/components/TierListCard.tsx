"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface TierListMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  itemCount: number;
  rowCount: number;
  previewColors: string[];
}

interface TierListCardProps {
  tierList: TierListMetadata;
  index: number;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: (cleanupHostedImages?: boolean) => void;
  hasHostedImages?: boolean;
}

export const TierListCard = memo(function TierListCard({
  tierList,
  index,
  onSelect,
  onDuplicate,
  onDelete,
  hasHostedImages = false,
}: TierListCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cleanupImages, setCleanupImages] = useState(false);

  const handleDelete = () => {
    onDelete(cleanupImages);
    setShowDeleteDialog(false);
    setCleanupImages(false);
  };

  const handleCloseDialog = (open: boolean) => {
    setShowDeleteDialog(open);
    if (!open) {
      setCleanupImages(false);
    }
  };

  // Use precomputed metadata
  const totalItems = tierList.itemCount;

  // Format the date (updatedAt is a timestamp)
  const updatedAt = new Date(tierList.updatedAt);
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        layout
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative"
      >
        <div
          onClick={onSelect}
          className={cn(
            "bg-card relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-300",
            "hover:border-primary/30 hover:shadow-primary/5 hover:shadow-lg",
            "active:scale-[0.98]"
          )}
        >
          {/* Preview Section - Tier Colors */}
          <div className="from-muted/50 to-muted relative h-36 overflow-hidden rounded-t-xl bg-linear-to-br">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-full w-full flex-col gap-1 p-2">
                {/* eslint-disable react/no-array-index-key -- Color array is stable for animation sequencing */}
                {tierList.previewColors.map((color, i) => (
                  <motion.div
                    key={`preview-${tierList.id}-${i}`}
                    style={{ backgroundColor: color }}
                    className="flex-1 rounded transition-all hover:scale-[1.02]"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + i * 0.05 }}
                  />
                ))}
                {/* eslint-enable react/no-array-index-key */}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-3 p-4">
            {/* Title */}
            <h3 className="group-hover:text-primary line-clamp-1 text-lg leading-tight font-semibold transition-colors">
              {tierList.title}
            </h3>

            {/* Meta info */}
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {/* Tier indicators */}
            <div className="flex gap-1">
              {/* eslint-disable react/no-array-index-key -- Color array is stable */}
              {tierList.previewColors.map((color, i) => (
                <div
                  key={`indicator-${tierList.id}-${i}`}
                  className="h-2 w-6 rounded-full transition-all duration-300"
                  style={{ backgroundColor: color }}
                />
              ))}
              {/* eslint-enable react/no-array-index-key */}
              {tierList.rowCount > tierList.previewColors.length && (
                <span className="text-muted-foreground text-xs">
                  +{tierList.rowCount - tierList.previewColors.length}
                </span>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/5 to-transparent"
          />
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute top-2 right-2 rounded-full shadow-md transition-all duration-200",
                // Mobile: always visible, larger touch target (40x40)
                // Desktop (md+): hover-reveal, smaller size (32x32)
                "h-10 w-10 md:h-8 md:w-8",
                "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                "bg-background/90 hover:bg-background"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onSelect}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={handleCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tier List?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{tierList.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Cleanup option - only show if there are hosted images */}
          {hasHostedImages && (
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                id={`cleanup-${tierList.id}`}
                checked={cleanupImages}
                onCheckedChange={(checked) =>
                  setCleanupImages(checked === true)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={`cleanup-${tierList.id}`}
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Delete hosted images
                </Label>
                <p className="text-muted-foreground text-xs">
                  Also delete images from imgbb. This will break any shared
                  links.
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
