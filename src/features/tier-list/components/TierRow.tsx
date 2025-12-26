"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  GripVertical,
  Settings2,
  Trash2,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { cn, getContrastColor } from "@/lib/utils";
import { TierRow as TierRowType } from "../index";
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
  const [editValue, setEditValue] = useState(row.name || row.level);
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
    if (trimmedValue && trimmedValue !== (row.name || row.level)) {
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
      setEditValue(row.name || row.level);
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
      <div className="flex rounded-lg border-2 border-primary bg-background opacity-95 shadow-2xl">
        {/* Drag Handle */}
        <div className="flex w-10 cursor-grabbing items-center justify-center border-r bg-muted/50 sm:w-8">
          <GripVertical className="h-6 w-6 text-primary sm:h-5 sm:w-5" />
        </div>

        {/* Tier Label */}
        <div
          className="flex w-16 min-w-[4rem] shrink-0 items-center justify-center p-1 font-bold sm:w-24 sm:min-w-[6rem]"
          style={{ backgroundColor: row.color }}
        >
          <span
            className="block w-full break-words text-center font-bold drop-shadow-sm"
            style={{
              color: textColor,
              fontSize: "14px",
              lineHeight: "1.2",
            }}
          >
            {row.name || row.level}
          </span>
        </div>

        {/* Tier Content */}
        <div className="flex min-h-[5rem] flex-1 flex-wrap content-start items-start gap-2 bg-muted/20 p-2">
          {row.items.map((item) => (
            <div
              key={item.id}
              className="h-[72px] w-[72px] overflow-hidden rounded-lg bg-muted"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary p-1.5 text-center text-[10px] font-medium text-secondary-foreground">
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
        "group/row relative flex border-b border-border transition-all duration-200 last:border-b-0",
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
          aria-label={`Drag to reorder tier ${row.name || row.level}`}
          aria-roledescription="draggable"
          data-drag-handle
          className={cn(
            "flex w-10 cursor-grab items-center justify-center border-r border-border bg-muted/20 active:cursor-grabbing sm:w-8",
            "group/handle transition-all duration-150 hover:bg-primary/10 active:bg-primary/20",
            "touch-none select-none"
          )}
          title="Drag to reorder"
        >
          <GripVertical className="h-6 w-6 text-muted-foreground/50 transition-colors group-hover/handle:text-primary sm:h-5 sm:w-5" />
        </div>
      )}

      {/* Tier Label */}
      <div
        className={cn(
          "group relative flex w-16 min-w-[4rem] shrink-0 items-center justify-center font-bold sm:w-24 sm:min-w-[6rem]",
          isExporting && "w-24 min-w-[6rem]"
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
            className="w-full resize-none overflow-hidden border-none bg-transparent p-1 text-center font-bold outline-none break-words focus:ring-1 focus:ring-white/30"
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
            aria-label={`Edit tier name: ${row.name || row.level}`}
          >
            <span
              className="block w-full break-words p-1 text-center font-bold drop-shadow-sm"
              style={{
                color: textColor,
                fontSize: "14px",
                lineHeight: "1.2",
              }}
            >
              {row.name || row.level}
            </span>
            {/* Edit hint icon - shows on hover */}
            {!isExporting && (
              <Pencil
                className="absolute bottom-1 right-1 h-3 w-3 opacity-0 transition-opacity group-hover/label:opacity-60"
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
                aria-label={`Settings for tier ${row.name || row.level}`}
                className={cn(
                  "absolute right-1 top-1 h-8 w-8 rounded-full sm:h-6 sm:w-6",
                  "bg-black/40 hover:scale-110 hover:bg-black/60 active:scale-95",
                  "border border-white/30 shadow-sm",
                  // Always visible on touch devices, hover-reveal on desktop
                  "opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100",
                  "transition-all duration-200"
                )}
              >
                <Settings2
                  className="h-4 w-4 text-white sm:h-3 sm:w-3"
                  aria-hidden="true"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[90vw] sm:w-64 max-w-xs" align="start" side="right">
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
                            ? "border-primary ring-2 ring-primary/30"
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
                    <span className="text-xs text-muted-foreground">
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
                    className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        className="flex min-h-[5rem] flex-1 flex-wrap content-start items-start gap-2 bg-muted/20 p-2"
      >
        <SortableContext
          items={itemIds}
          strategy={horizontalListSortingStrategy}
        >
          {row.items.map((item) => (
            <TierItem key={item.id} item={item} containerId={row.id} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
});
