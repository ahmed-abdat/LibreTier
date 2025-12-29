"use client";

import { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type TierItem as TierItemType } from "../index";
import { useTierStore, useDragStore } from "../store";
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
  const isAnyDragging = useDragStore((state) => state.isDragging);
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
          /* eslint-disable-next-line @next/next/no-img-element -- Base64 data URLs not supported by next/image */
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="bg-secondary text-secondary-foreground flex h-full w-full items-center justify-center p-1.5 text-center text-[10px] leading-tight font-medium">
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
        /* eslint-disable-next-line @next/next/no-img-element -- Base64 data URLs not supported by next/image */
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="h-full w-full animate-[fadeIn_0.2s_ease-in] object-cover"
          draggable={false}
          onError={() => setImageError(true)}
        />
      );
    }

    // Text fallback for items without images or failed loads
    return (
      <div className="bg-secondary text-secondary-foreground flex h-full w-full items-center justify-center p-1.5 text-center text-[10px] leading-tight font-medium">
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
        className="border-primary bg-background relative h-[72px] w-[72px] overflow-hidden rounded-lg border-2 shadow-2xl"
      >
        {renderContent()}
        {/* Drag indicator overlay */}
        <div className="bg-primary/15 pointer-events-none absolute inset-0" />
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
              "shadow-xs hover:shadow-lg",
              "hover:border-primary/60 border-transparent",
              "group-hover:scale-105"
            )}
          >
            {renderContent()}

            {/* Subtle hover overlay */}
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/10" />
          </div>

          {/* Delete button - hidden during drag, positioned outside the clipped area */}
          {!isAnyDragging && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteItem(item.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "absolute -top-1.5 -right-1.5 rounded-full",
                // Mobile: 24x24 touch target, semi-visible
                // Desktop (md+): smaller size (20x20), hover-reveal with scale
                "h-6 w-6 md:h-5 md:w-5",
                "bg-destructive text-destructive-foreground",
                "flex items-center justify-center",
                "scale-100 opacity-80 md:scale-75 md:opacity-0",
                "md:group-hover:scale-100 md:group-hover:opacity-100",
                "transition-all duration-150 ease-out",
                "shadow-md hover:shadow-lg",
                "hover:bg-destructive/90 active:scale-90",
                "focus:ring-destructive/50 z-20 focus:ring-2 focus:outline-hidden"
              )}
              aria-label={`Remove ${item.name}`}
            >
              <X className="h-3.5 w-3.5 md:h-3 md:w-3" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[180px] px-3 py-2"
        sideOffset={8}
      >
        <p className="text-sm leading-tight font-medium">{item.name}</p>
        {item.description && (
          <p className="text-muted-foreground mt-1 text-xs leading-snug">
            {item.description}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
});
