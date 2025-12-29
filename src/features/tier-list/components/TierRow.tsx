"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import {
  GripVertical,
  Settings2,
  Trash2,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { cn, getContrastColor } from "@/lib/utils";
import { type TierRow as TierRowType } from "../index";
import { TierItem } from "./TierItem";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useTierStore } from "../store";
import { PRESET_COLORS } from "../constants";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

interface TierRowProps {
  row: TierRowType;
  isExporting?: boolean;
  isRowDragging?: boolean;
  isRowOverlay?: boolean;
}

export const TierRow = memo(function TierRow({
  row,
  isExporting,
  isRowDragging,
  isRowOverlay,
}: TierRowProps) {
  const updateTier = useTierStore((state) => state.updateTier);
  const deleteTier = useTierStore((state) => state.deleteTier);
  const clearTierItems = useTierStore((state) => state.clearTierItems);

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(row.name ?? row.level);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useAutoResizeTextarea(inputRef, editValue);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      // Trigger resize immediately when entering edit mode
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  // Handle save
  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== (row.name ?? row.level)) {
      updateTier(row.id, { name: trimmedValue });
    }
    setIsEditing(false);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(row.name ?? row.level);
      setIsEditing(false);
    }
  };

  // Sortable for row reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `row-${row.id}`,
    data: {
      type: "row",
      row,
    },
  });

  // Droppable for items
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `tier-${row.id}`,
    data: {
      type: "tier",
      tierId: row.id,
    },
  });

  const itemIds = row.items.map((item) => item.id);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    WebkitTouchCallout: "none",
    willChange: "transform",
  };

  const textColor = getContrastColor(row.color);

  // Row overlay when dragging
  if (isRowOverlay) {
    return (
      <div className="border-primary bg-background flex rounded-lg border-2 opacity-95 shadow-2xl">
        {/* Drag Handle */}
        <div className="bg-muted/50 flex w-8 cursor-grabbing items-center justify-center border-r">
          <GripVertical className="text-primary h-5 w-5" />
        </div>

        {/* Tier Label */}
        <div
          className="flex w-20 min-w-20 shrink-0 items-center justify-center p-2 font-bold sm:w-24 sm:min-w-24"
          style={{ backgroundColor: row.color }}
        >
          <span
            className="block w-full text-center font-bold wrap-break-word drop-shadow-xs"
            style={{
              color: textColor,
              fontSize: "13px",
              lineHeight: "1.3",
            }}
          >
            {row.name ?? row.level}
          </span>
        </div>

        {/* Tier Content */}
        <div className="bg-muted/20 grid min-h-20 flex-1 grid-cols-[repeat(auto-fill,72px)] content-start items-start gap-2 p-2">
          {row.items.map((item) => (
            <div
              key={item.id}
              className="bg-muted h-[72px] w-[72px] overflow-hidden rounded-lg"
            >
              {item.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- Base64 data URLs not supported by next/image */
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="bg-secondary text-secondary-foreground flex h-full w-full items-center justify-center p-1.5 text-center text-[10px] font-medium">
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        "group/row border-border relative flex border-b transition-all duration-200 last:border-b-0",
        // Hover effects - using box-shadow instead of border to avoid layout shift
        "hover:shadow-[inset_4px_0_0_0_hsl(var(--primary)/0.4),0_4px_12px_-4px_hsl(var(--primary)/0.1)]",
        "hover:bg-muted/5",
        isDragging && "bg-muted/50 opacity-50",
        isRowDragging && !isDragging && "translate-y-0"
      )}
    >
      {/* Drag Handle - Hidden during export */}
      {!isExporting && (
        <div
          {...attributes}
          {...listeners}
          role="button"
          aria-label={`Drag to reorder tier ${row.name ?? row.level}`}
          aria-roledescription="draggable"
          data-drag-handle
          className={cn(
            "border-border bg-muted/20 flex w-8 cursor-grab items-center justify-center border-r active:cursor-grabbing",
            "group/handle hover:bg-primary/10 active:bg-primary/20 transition-all duration-150",
            "touch-none select-none"
          )}
          title="Drag to reorder"
        >
          <GripVertical className="text-muted-foreground/50 group-hover/handle:text-primary h-5 w-5 transition-colors" />
        </div>
      )}

      {/* Tier Label */}
      <div
        className={cn(
          "group relative flex w-20 min-w-20 shrink-0 items-center justify-center p-1.5 font-bold sm:w-24 sm:min-w-24 sm:p-2",
          isExporting && "w-24 min-w-24"
        )}
        style={{ backgroundColor: row.color }}
      >
        {/* Inline editable tier name */}
        {isEditing && !isExporting ? (
          <textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-multiline="true"
            className="w-full resize-none overflow-hidden border-none bg-transparent p-1 text-center font-bold wrap-break-word outline-hidden focus:ring-1 focus:ring-white/30"
            style={{
              color: textColor,
              fontSize: "14px",
              lineHeight: "1.2",
              wordBreak: "break-word",
            }}
          />
        ) : (
          <button
            onClick={() => !isExporting && setIsEditing(true)}
            className={cn(
              "group/label relative flex h-full w-full cursor-text items-center justify-center",
              !isExporting && "transition-colors hover:bg-black/10"
            )}
            title={!isExporting ? "Click to edit tier name" : undefined}
            aria-label={`Edit tier name: ${row.name ?? row.level}`}
          >
            <span
              className="block w-full p-1.5 text-center font-bold wrap-break-word drop-shadow-xs sm:p-1"
              style={{
                color: textColor,
                fontSize: "13px",
                lineHeight: "1.3",
              }}
            >
              {row.name ?? row.level}
            </span>
            {/* Edit hint icon - shows on hover */}
            {!isExporting && (
              <Pencil
                className="absolute right-1 bottom-1 h-3 w-3 opacity-0 transition-opacity group-hover/label:opacity-60"
                style={{ color: textColor }}
              />
            )}
          </button>
        )}

        {/* Settings button - hidden during export */}
        {!isExporting && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Settings for tier ${row.name ?? row.level}`}
                className={cn(
                  "absolute -top-1.5 -right-1.5 rounded-full",
                  // Mobile: 28x28 touch target, semi-visible
                  // Desktop (md+): smaller size (24x24), hover-reveal
                  "h-7 w-7 md:h-6 md:w-6",
                  "bg-black/50 hover:scale-110 hover:bg-black/70 active:scale-95",
                  "border border-white/20 shadow-md",
                  "opacity-70 md:opacity-0 md:group-hover/row:opacity-100",
                  "transition-all duration-200"
                )}
              >
                <Settings2
                  className="h-3.5 w-3.5 text-white md:h-3 md:w-3"
                  aria-hidden="true"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[90vw] max-w-xs sm:w-64"
              align="start"
              side="right"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Color</span>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Preset colors"
                  >
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        role="radio"
                        aria-checked={row.color === color}
                        aria-label={`Select color ${color}`}
                        className={cn(
                          "h-7 w-7 rounded-md border-2 transition-all hover:scale-110",
                          row.color === color
                            ? "border-primary ring-primary/30 ring-2"
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTier(row.id, { color })}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={row.color}
                      onChange={(e) =>
                        updateTier(row.id, { color: e.target.value })
                      }
                      className="h-8 w-12 cursor-pointer p-1"
                    />
                    <span className="text-muted-foreground text-xs">
                      Custom color
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 border-t pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => clearTierItems(row.id)}
                    disabled={row.items.length === 0}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear Items
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-2"
                    onClick={() => deleteTier(row.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Tier
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Tier Content (Droppable Area) */}
      <div
        ref={setDroppableRef}
        className="bg-muted/20 grid min-h-20 flex-1 grid-cols-[repeat(auto-fill,72px)] content-start items-start gap-2 p-2"
      >
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          {row.items.map((item) => (
            <TierItem key={item.id} item={item} containerId={row.id} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
});
