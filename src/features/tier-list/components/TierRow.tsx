"use client";

import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, Settings2, Trash2, RotateCcw, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { TierRow as TierRowType } from "../index";
import { TierItem } from "./TierItem";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTierStore } from "../store";
import { PRESET_COLORS } from "../constants";

interface TierRowProps {
  row: TierRowType;
  isExporting?: boolean;
  isOver?: boolean;
  isRowDragging?: boolean;
  isRowOverlay?: boolean;
}


export function TierRow({
  row,
  isExporting,
  isOver: isOverProp,
  isRowDragging,
  isRowOverlay
}: TierRowProps) {
  const updateTier = useTierStore((state) => state.updateTier);
  const deleteTier = useTierStore((state) => state.deleteTier);
  const clearTierItems = useTierStore((state) => state.clearTierItems);

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(row.name || row.level);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
    if (e.key === "Enter") {
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
  const { setNodeRef: setDroppableRef, isOver: isDroppableOver } = useDroppable({
    id: `tier-${row.id}`,
    data: {
      type: "tier",
      tierId: row.id,
    },
  });

  const itemIds = row.items.map((item) => item.id);
  const showDropHighlight = isOverProp || isDroppableOver;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Helper function to determine if text should be dark or light based on background
  const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Using relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const textColor = getContrastColor(row.color);

  // Row overlay when dragging
  if (isRowOverlay) {
    return (
      <div className="flex border-2 border-primary rounded-lg shadow-2xl bg-background opacity-95">
        {/* Drag Handle */}
        <div className="w-8 flex items-center justify-center bg-muted/50 border-r cursor-grabbing">
          <GripVertical className="h-5 w-5 text-primary" />
        </div>

        {/* Tier Label */}
        <div
          className="w-24 min-w-[6rem] flex items-center justify-center font-bold text-xl shrink-0"
          style={{ backgroundColor: row.color }}
        >
          <span
            className="drop-shadow-sm select-none"
            style={{ color: textColor }}
          >
            {row.name || row.level}
          </span>
        </div>

        {/* Tier Content */}
        <div className="flex-1 min-h-[5rem] p-2 flex flex-wrap gap-2 items-start content-start bg-muted/20">
          {row.items.map((item) => (
            <div
              key={item.id}
              className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-muted"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-center p-1.5 font-medium bg-secondary text-secondary-foreground">
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
        "flex border-b border-border last:border-b-0 transition-all duration-200",
        isDragging && "opacity-50 bg-muted/50",
        isRowDragging && !isDragging && "translate-y-0"
      )}
    >
      {/* Drag Handle - Hidden during export */}
      {!isExporting && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "w-8 flex items-center justify-center bg-muted/20 border-r border-border cursor-grab active:cursor-grabbing",
            "hover:bg-primary/10 transition-all duration-150 group/handle"
          )}
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground/50 group-hover/handle:text-primary transition-colors" />
        </div>
      )}

      {/* Tier Label */}
      <div
        className={cn(
          "w-24 min-w-[6rem] flex items-center justify-center font-bold text-xl shrink-0 relative group",
          isExporting && "w-24"
        )}
        style={{ backgroundColor: row.color }}
      >
        {/* Inline editable tier name */}
        {isEditing && !isExporting ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent text-center font-bold text-xl outline-none border-2 border-white/50 rounded px-1"
            style={{ color: textColor }}
            maxLength={10}
          />
        ) : (
          <button
            onClick={() => !isExporting && setIsEditing(true)}
            className={cn(
              "relative flex items-center justify-center w-full h-full cursor-text group/label",
              !isExporting && "hover:bg-black/10 transition-colors"
            )}
            title={!isExporting ? "Click to edit tier name" : undefined}
            aria-label={`Edit tier name: ${row.name || row.level}`}
          >
            <span
              className="drop-shadow-sm select-none"
              style={{ color: textColor }}
            >
              {row.name || row.level}
            </span>
            {/* Edit hint icon - shows on hover */}
            {!isExporting && (
              <Pencil
                className="absolute bottom-1 right-1 h-3 w-3 opacity-0 group-hover/label:opacity-60 transition-opacity"
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
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/30 hover:bg-black/50 hover:scale-110 rounded-full"
              >
                <Settings2 className="h-3 w-3 text-white" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start" side="right">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
                          row.color === color
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-transparent hover:border-muted-foreground/50"
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
                      className="w-12 h-8 p-1 cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">Custom color</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t space-y-2">
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
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
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
        className={cn(
          "flex-1 min-h-[5rem] p-2 flex flex-wrap gap-2 items-start content-start transition-all duration-200",
          showDropHighlight
            ? "bg-primary/10 ring-2 ring-inset ring-primary/40"
            : "bg-muted/20"
        )}
      >
        <SortableContext items={itemIds} strategy={horizontalListSortingStrategy}>
          {row.items.map((item) => (
            <TierItem key={item.id} item={item} containerId={row.id} />
          ))}
        </SortableContext>

        {/* Only show drop hint during drag, never during export */}
        {row.items.length === 0 && showDropHighlight && !isExporting && (
          <div className="w-full h-full min-h-[3.5rem] flex items-center justify-center text-sm text-primary font-medium animate-pulse">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
