"use client";

import { useState } from "react";
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
import { TierList } from "../index";
import { Button } from "@/components/ui/button";
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

interface TierListCardProps {
  tierList: TierList;
  index: number;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function TierListCard({
  tierList,
  index,
  onSelect,
  onDuplicate,
  onDelete,
}: TierListCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate total items
  const totalItems =
    tierList.rows.reduce((acc, row) => acc + row.items.length, 0) +
    tierList.unassignedItems.length;

  // Get preview images (first 4 items with images)
  const previewImages = tierList.rows
    .flatMap((row) => row.items)
    .concat(tierList.unassignedItems)
    .filter((item) => item.imageUrl)
    .slice(0, 4);

  // Format the date
  const updatedAt =
    tierList.updatedAt instanceof Date
      ? tierList.updatedAt
      : new Date(tierList.updatedAt);
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
            "relative cursor-pointer overflow-hidden rounded-xl border bg-card transition-all duration-300",
            "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
            "active:scale-[0.98]"
          )}
        >
          {/* Preview Section */}
          <div className="relative h-36 overflow-hidden rounded-t-xl bg-gradient-to-br from-muted/50 to-muted">
            {previewImages.length > 0 ? (
              <div className="absolute inset-0 grid grid-cols-2 gap-0.5 overflow-hidden rounded-t-xl">
                {previewImages.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 + i * 0.05 }}
                    className={cn(
                      "relative overflow-hidden",
                      previewImages.length === 1 &&
                        "col-span-2 row-span-2 rounded-t-xl",
                      previewImages.length === 2 && "row-span-2",
                      previewImages.length === 2 && i === 0 && "rounded-tl-xl",
                      previewImages.length === 2 && i === 1 && "rounded-tr-xl",
                      previewImages.length >= 3 &&
                        i === 0 &&
                        "row-span-2 rounded-tl-xl",
                      previewImages.length >= 3 && i === 1 && "rounded-tr-xl"
                    )}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40">
                <ImageIcon className="mb-2 h-12 w-12" />
                <span className="text-sm">No images yet</span>
              </div>
            )}

            {/* Tier preview strip at bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex h-6 overflow-hidden">
              {tierList.rows.slice(0, 5).map((row) => (
                <motion.div
                  key={row.id}
                  style={{ backgroundColor: row.color }}
                  className="flex min-w-[2rem] flex-1 items-center justify-center"
                  initial={{ y: 24 }}
                  animate={{ y: isHovered ? 0 : 24 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="truncate px-1 text-[10px] font-bold text-black/70">
                    {row.name || row.level}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-3 p-4">
            {/* Title */}
            <h3 className="line-clamp-1 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
              {tierList.title}
            </h3>

            {/* Meta info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
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

            {/* Tier summary */}
            <div className="flex gap-1">
              {tierList.rows.map((row) => {
                const itemCount = row.items.length;
                return (
                  <div
                    key={row.id}
                    className="group/tier relative"
                    title={`${row.name || row.level}: ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                  >
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        itemCount > 0 ? "min-w-[1rem]" : "w-2"
                      )}
                      style={{
                        backgroundColor: row.color,
                        width:
                          itemCount > 0
                            ? `${Math.min(itemCount * 8 + 8, 48)}px`
                            : undefined,
                        opacity: itemCount > 0 ? 1 : 0.3,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"
          />
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute right-2 top-2 h-8 w-8 rounded-full shadow-md transition-all duration-200",
                "opacity-0 group-hover:opacity-100",
                "bg-background/90 hover:bg-background"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
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
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tier List?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{tierList.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
