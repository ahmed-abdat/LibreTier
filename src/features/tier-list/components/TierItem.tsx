"use client";

import { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TierItem as TierItemType } from "../index";
import { useTierStore } from "../store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TierItemProps {
  item: TierItemType;
  containerId: string | null; // null = unassigned pool
  isOverlay?: boolean;
}

export const TierItem = memo(function TierItem({
  item,
  containerId,
  isOverlay,
}: TierItemProps) {
  const deleteItem = useTierStore((state) => state.deleteItem);
  const [imageError, setImageError] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "item",
      item,
      containerId,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    WebkitTouchCallout: "none",
    willChange: "transform",
  };

  // Show faded preview at drop position during drag
  // This shows where the item will land when dropped
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[72px] w-[72px] overflow-hidden rounded-lg opacity-40"
        {...attributes}
        {...listeners}
      >
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary p-1.5 text-center text-[10px] font-medium leading-tight text-secondary-foreground">
            <span className="line-clamp-3">{item.name}</span>
          </div>
        )}
      </div>
    );
  }

  // Render image or fallback
  const renderContent = () => {
    if (item.imageUrl && !imageError) {
      return (
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover animate-[fadeIn_0.2s_ease-in]"
          draggable={false}
          onError={() => setImageError(true)}
        />
      );
    }

    // Text fallback for items without images or failed loads
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary p-1.5 text-center text-[10px] font-medium leading-tight text-secondary-foreground">
        <span className="line-clamp-3">{item.name}</span>
      </div>
    );
  };

  // Drag overlay - shows while dragging with smooth animation
  if (isOverlay) {
    return (
      <motion.div
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: 1.1, rotate: 2 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="relative h-[72px] w-[72px] overflow-hidden rounded-lg border-2 border-primary bg-background shadow-2xl"
      >
        {renderContent()}
        {/* Drag indicator overlay */}
        <div className="pointer-events-none absolute inset-0 bg-primary/15" />
      </motion.div>
    );
  }

  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={cn(
            "group relative h-[72px] w-[72px] cursor-grab overflow-visible rounded-lg active:cursor-grabbing",
            "transition-all duration-150 ease-out",
            "hover:z-10",
            "touch-none select-none"
          )}
        >
          {/* Main item container */}
          <div
            className={cn(
              "relative h-full w-full overflow-hidden rounded-lg",
              "border-2 transition-all duration-150",
              "shadow-sm hover:shadow-lg",
              "border-transparent hover:border-primary/60",
              "group-hover:scale-105"
            )}
          >
            {renderContent()}

            {/* Subtle hover overlay */}
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/10" />
          </div>

          {/* Delete button - positioned outside the clipped area */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              deleteItem(item.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              "absolute -right-2 -top-2 h-7 w-7 rounded-full sm:h-6 sm:w-6",
              "bg-destructive text-destructive-foreground",
              "flex items-center justify-center",
              // Always visible on mobile (coarse pointer), hover-reveal on desktop
              "scale-100 opacity-100 [@media(hover:hover)]:scale-75 [@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-hover:opacity-100",
              "transition-all duration-150 ease-out",
              "shadow-lg hover:shadow-xl",
              "hover:bg-destructive/90 active:scale-90",
              "z-20 focus:outline-none focus:ring-2 focus:ring-destructive/50"
            )}
            aria-label={`Remove ${item.name}`}
          >
            <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[180px] px-3 py-2"
        sideOffset={8}
      >
        <p className="text-sm font-medium leading-tight">{item.name}</p>
        {item.description && (
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
});
