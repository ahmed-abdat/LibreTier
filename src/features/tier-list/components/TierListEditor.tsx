"use client";

import { useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  RotateCcw,
  Plus,
  Pencil,
  MoreVertical,
  Undo2,
  Redo2,
} from "lucide-react";
import { useTierStore, useTemporalStore } from "../store";
import { TIER_DEFAULTS } from "../constants";
import { TierRow } from "./TierRow";
import { TierItem } from "./TierItem";
import { ItemPool } from "./ItemPool";
import { ImageUpload } from "./ImageUpload";
import { ExportButton } from "./ExportButton";
import { useTierListDnd } from "../hooks/useTierListDnd";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Type } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function TierListEditor() {
  const exportRef = useRef<HTMLDivElement>(null);

  const {
    getCurrentList,
    updateList,
    clearAllItems,
    moveItem,
    reorderTiers,
    reorderItemsInContainer,
    addCustomTier,
  } = useTierStore();

  const currentList = getCurrentList();

  const {
    activeItem,
    activeRow,
    activeDragType,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    collisionDetection,
  } = useTierListDnd({
    currentList,
    moveItem,
    reorderTiers,
    reorderItemsInContainer,
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Track if currently dragging (for disabling undo during drag)
  const isDragging = activeDragType !== null;

  // Undo/Redo state (reactive)
  const canUndo = useTemporalStore((state) => state.pastStates.length > 0);
  const canRedo = useTemporalStore((state) => state.futureStates.length > 0);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore during drag operations
      if (isDragging) return;

      // Ignore if user is typing in an input/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac =
        typeof navigator !== "undefined" && navigator.platform.includes("Mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useTierStore.temporal.getState().undo();
      }
      if (modifier && e.key === "y") {
        e.preventDefault();
        useTierStore.temporal.getState().redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDragging]);

  // Clear undo history when entering/leaving editor (prevents cross-list confusion)
  useEffect(() => {
    // Clear on mount (fresh start for this list)
    useTierStore.temporal.getState().clear();

    // Clear on unmount (free memory)
    return () => {
      useTierStore.temporal.getState().clear();
    };
  }, []);

  if (!currentList) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const rowIds = currentList.rows.map((row) => `row-${row.id}`);

  const totalItems =
    currentList.rows.reduce((acc, row) => acc + row.items.length, 0) +
    currentList.unassignedItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="group relative inline-flex items-center gap-2">
            <h1
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const newTitle =
                  e.currentTarget.textContent?.trim() || "Untitled Tier List";
                if (newTitle !== currentList.title) {
                  updateList({ title: newTitle });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                const selection = window.getSelection();
                if (selection?.rangeCount) {
                  selection.deleteFromDocument();
                  selection
                    .getRangeAt(0)
                    .insertNode(document.createTextNode(text));
                  selection.collapseToEnd();
                }
              }}
              className="cursor-text rounded-md px-2 py-1 font-bold outline-none transition-colors hover:bg-muted/30 focus:bg-muted/20 focus:ring-2 focus:ring-primary/20"
              style={{
                fontSize: `${currentList.titleFontSize || 24}px`,
              }}
            >
              {currentList.title}
            </h1>
            <Pencil className="pointer-events-none h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-50" />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Adjust title font size"
                >
                  <Type className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-3">
                  <Label htmlFor="title-font-size">
                    Title Font Size: {currentList.titleFontSize || 24}px
                  </Label>
                  <input
                    id="title-font-size"
                    type="range"
                    min="16"
                    max="48"
                    step="1"
                    value={currentList.titleFontSize || 24}
                    onChange={(e) => {
                      updateList({
                        titleFontSize: parseInt(e.target.value, 10),
                      });
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>16px</span>
                    <span>48px</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <p className="mt-1 px-2 text-xs text-muted-foreground">
            {totalItems === 0
              ? "No items yet — upload some images to get started"
              : `${totalItems} ${totalItems === 1 ? "item" : "items"} • ${currentList.rows.length} ${currentList.rows.length === 1 ? "tier" : "tiers"}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 px-2 sm:px-0">
          {/* Undo/Redo buttons */}
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-9 sm:w-9"
                  disabled={!canUndo || isDragging}
                  onClick={() => useTierStore.temporal.getState().undo()}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-9 sm:w-9"
                  disabled={!canRedo || isDragging}
                  onClick={() => useTierStore.temporal.getState().redo()}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Shift+Z)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ExportButton
            targetRef={exportRef}
            filename={currentList.title.toLowerCase().replace(/\s+/g, "-")}
            hasItems={currentList.rows.some((row) => row.items.length > 0)}
          />
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-9 sm:w-9"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset All Items
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Tier List?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all items from all tiers. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearAllItems();
                        toast.success("Tier list reset");
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        {/* Tier List - Export Target */}
        <div
          ref={exportRef}
          data-export-target
          className="overflow-hidden rounded-xl border bg-background shadow-lg"
        >
          {/* Title - Hidden in editor (shows in header), visible in export */}
          <div
            data-export-title
            className="hidden border-b bg-gradient-to-r from-muted/80 to-muted/40 px-4 py-3"
          >
            <h2
              className="font-bold"
              style={{ fontSize: `${currentList.titleFontSize || 24}px` }}
            >
              {currentList.title}
            </h2>
          </div>

          {/* Tier Rows with Sortable Context for row reordering */}
          <SortableContext
            items={rowIds}
            strategy={verticalListSortingStrategy}
          >
            {currentList.rows.map((row) => (
              <TierRow
                key={row.id}
                row={row}
                isOver={
                  overId === `tier-${row.id}` ||
                  overId === `row-${row.id}` ||
                  row.items.some((item) => item.id === overId)
                }
                isRowDragging={activeDragType === "row"}
              />
            ))}
          </SortableContext>
        </div>

        {/* Unassigned Items Pool - Close to tiers for easy drag */}
        <ItemPool
          items={currentList.unassignedItems}
          isOver={
            overId === "unassigned-pool" ||
            currentList.unassignedItems.some((item) => item.id === overId)
          }
        />

        {/* Add Tier Button */}
        <Button
          variant="outline"
          className="group w-full gap-2 border-2 border-dashed py-3 transition-all hover:border-primary hover:bg-primary/5"
          onClick={() => {
            const existingNames = currentList.rows.map((r) => r.name);
            const nextIndex = currentList.rows.length % TIER_DEFAULTS.length;
            const baseName = TIER_DEFAULTS[nextIndex].name;
            let newName: string = baseName;
            let counter = 1;
            while (existingNames.includes(newName)) {
              newName = `${baseName}${counter}`;
              counter++;
            }
            addCustomTier(newName, TIER_DEFAULTS[nextIndex].color);
            toast.success(`Added tier "${newName}"`);
          }}
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          Add New Tier
        </Button>

        {/* Image Upload - At the bottom for adding new items */}
        <ImageUpload />

        {/* Drag Overlay */}
        <DragOverlay
          dropAnimation={{
            duration: 250,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeDragType === "item" && activeItem ? (
            <TierItem item={activeItem} containerId={null} isOverlay />
          ) : null}
          {activeDragType === "row" && activeRow ? (
            <TierRow row={activeRow} isRowOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Help text */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t pt-4 text-[10px] text-muted-foreground sm:gap-x-6 sm:text-xs">
        <span className="flex items-center gap-1.5">
          <Kbd>Drag</Kbd>
          items to rank
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Space</Kbd>
          to grab,
          <Kbd>Arrows</Kbd>
          to move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Ctrl+Z</Kbd>
          undo
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <Kbd>Ctrl+Shift+Z</Kbd>
          redo
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Kbd>Esc</Kbd>
          to cancel
        </span>
      </div>
    </div>
  );
}
