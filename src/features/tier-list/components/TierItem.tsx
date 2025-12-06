"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
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

export function TierItem({ item, containerId, isOverlay }: TierItemProps) {
  const deleteItem = useTierStore((state) => state.deleteItem);
  const [imageLoaded, setImageLoaded] = useState(false);
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Render image or fallback
  const renderContent = (showLoadingState = true) => {
    if (item.imageUrl && !imageError) {
      return (
        <>
          {/* Loading skeleton */}
          {showLoadingState && !imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={item.imageUrl}
            alt={item.name}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              showLoadingState && !imageLoaded ? "opacity-0" : "opacity-100"
            )}
            draggable={false}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </>
      );
    }

    // Text fallback for items without images or failed loads
    return (
      <div className="w-full h-full flex items-center justify-center text-[10px] text-center p-1.5 font-medium bg-secondary text-secondary-foreground leading-tight">
        <span className="line-clamp-3">{item.name}</span>
      </div>
    );
  };

  // Drag overlay - shows while dragging
  if (isOverlay) {
    return (
      <div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden bg-background border-2 border-primary shadow-2xl scale-110 rotate-2">
        {renderContent(false)}
        {/* Drag indicator overlay */}
        <div className="absolute inset-0 bg-primary/15 pointer-events-none" />
      </div>
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
            "relative w-[72px] h-[72px] rounded-lg overflow-visible cursor-grab active:cursor-grabbing group",
            "transition-all duration-150 ease-out",
            "hover:z-10",
            isDragging && "opacity-40 scale-95"
          )}
        >
          {/* Main item container */}
          <div
            className={cn(
              "relative w-full h-full rounded-lg overflow-hidden",
              "border-2 transition-all duration-150",
              "shadow-sm hover:shadow-lg",
              isDragging
                ? "border-dashed border-primary bg-primary/10"
                : "border-transparent hover:border-primary/60",
              "group-hover:scale-105"
            )}
          >
            {renderContent()}

            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150 pointer-events-none" />
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
              "absolute -top-2 -right-2 w-7 h-7 sm:w-6 sm:h-6 rounded-full",
              "bg-destructive text-destructive-foreground",
              "flex items-center justify-center",
              // Always visible on mobile (coarse pointer), hover-reveal on desktop
              "opacity-100 scale-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:scale-75",
              "[@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:scale-100",
              "transition-all duration-150 ease-out",
              "shadow-lg hover:shadow-xl",
              "hover:bg-destructive/90 active:scale-90",
              "z-20 focus:outline-none focus:ring-2 focus:ring-destructive/50"
            )}
            aria-label={`Remove ${item.name}`}
          >
            <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[180px] px-3 py-2"
        sideOffset={8}
      >
        <p className="font-medium text-sm leading-tight">{item.name}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-snug">{item.description}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
