"use client";

import { useRef, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  pointerWithin,
  rectIntersection,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { RotateCcw, Plus } from "lucide-react";
import { useTierStore } from "../store";
import { TierItem as TierItemType, TierRow as TierRowType } from "../index";
import { TIER_DEFAULTS } from "../constants";
import { TierRow } from "./TierRow";
import { TierItem } from "./TierItem";
import { ItemPool } from "./ItemPool";
import { ImageUpload } from "./ImageUpload";
import { ExportButton } from "./ExportButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type ActiveDragType = "item" | "row" | null;

export function TierListEditor() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] = useState<TierItemType | null>(null);
  const [activeRow, setActiveRow] = useState<TierRowType | null>(null);
  const [activeDragType, setActiveDragType] = useState<ActiveDragType>(null);
  const [overId, setOverId] = useState<string | null>(null);

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find which container (tier or pool) an item belongs to
  const findContainer = useCallback(
    (id: string): string | null => {
      if (!currentList) return null;

      // Check if it's a container ID itself
      if (id === "unassigned-pool") return null;
      if (id.startsWith("tier-")) {
        const tierId = id.replace("tier-", "");
        if (currentList.rows.some((r) => r.id === tierId)) return tierId;
      }
      if (id.startsWith("row-")) {
        return id; // It's a row being dragged
      }

      // Check unassigned pool
      if (currentList.unassignedItems.some((item) => item.id === id)) {
        return "unassigned";
      }

      // Check tiers
      for (const row of currentList.rows) {
        if (row.items.some((item) => item.id === id)) {
          return row.id;
        }
      }

      return null;
    },
    [currentList]
  );

  // Find an item by ID
  const findItem = useCallback(
    (id: string): TierItemType | undefined => {
      if (!currentList) return undefined;

      const unassignedItem = currentList.unassignedItems.find(
        (item) => item.id === id
      );
      if (unassignedItem) return unassignedItem;

      for (const row of currentList.rows) {
        const item = row.items.find((item) => item.id === id);
        if (item) return item;
      }

      return undefined;
    },
    [currentList]
  );

  // Find a row by ID
  const findRow = useCallback(
    (id: string): TierRowType | undefined => {
      if (!currentList) return undefined;
      const rowId = id.startsWith("row-") ? id.replace("row-", "") : id;
      return currentList.rows.find((r) => r.id === rowId);
    },
    [currentList]
  );

  // Get items for a container
  const getContainerItems = useCallback(
    (containerId: string | null): TierItemType[] => {
      if (!currentList) return [];

      if (containerId === null || containerId === "unassigned") {
        return currentList.unassignedItems;
      }

      const row = currentList.rows.find((r) => r.id === containerId);
      return row?.items || [];
    },
    [currentList]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = active.id as string;

      // Check if dragging a row
      if (activeId.startsWith("row-")) {
        const row = findRow(activeId);
        if (row) {
          setActiveRow(row);
          setActiveDragType("row");
        }
        return;
      }

      // Dragging an item
      const item = findItem(activeId);
      if (item) {
        setActiveItem(item);
        setActiveDragType("item");
      }
    },
    [findItem, findRow]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      setOverId(over?.id as string | null);
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      const wasRowDrag = activeDragType === "row";

      setActiveItem(null);
      setActiveRow(null);
      setActiveDragType(null);
      setOverId(null);

      if (!over || !currentList) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle row reordering - rows can only be dropped on other rows
      if (wasRowDrag) {
        // Only process if dropped on another row
        if (!overId.startsWith("row-")) {
          // Invalid drop target - row returns to original position
          return;
        }

        const activeRowId = activeId.replace("row-", "");
        const overRowId = overId.replace("row-", "");

        const activeIndex = currentList.rows.findIndex((r) => r.id === activeRowId);
        const overIndex = currentList.rows.findIndex((r) => r.id === overRowId);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          reorderTiers(activeIndex, overIndex);
        }
        return;
      }

      // Handle item dragging
      // Get source container
      let sourceContainerId = findContainer(activeId);
      if (sourceContainerId === "unassigned") sourceContainerId = null;

      // Determine target container
      let targetContainerId: string | null = null;
      let targetIndex: number | undefined;

      // Check what we're dropping over
      if (overId === "unassigned-pool") {
        targetContainerId = null;
      } else if (overId.startsWith("tier-")) {
        targetContainerId = overId.replace("tier-", "");
      } else if (overId.startsWith("row-")) {
        // Dropping over a row - add to that tier
        targetContainerId = overId.replace("row-", "");
      } else {
        // Dropping over another item
        const overContainer = findContainer(overId);
        if (overContainer === "unassigned") {
          targetContainerId = null;
        } else {
          targetContainerId = overContainer;
        }

        // Get the index of the item we're dropping over
        const containerItems = getContainerItems(
          overContainer === "unassigned" ? null : overContainer
        );
        const overIndex = containerItems.findIndex((item) => item.id === overId);
        if (overIndex !== -1) {
          targetIndex = overIndex;
        }
      }

      // If same container, handle reordering
      if (sourceContainerId === targetContainerId && targetIndex !== undefined) {
        const containerItems = getContainerItems(sourceContainerId);
        const activeIndex = containerItems.findIndex((item) => item.id === activeId);

        if (activeIndex !== -1 && activeIndex !== targetIndex) {
          // Reorder within the same container
          const newItems = arrayMove(containerItems, activeIndex, targetIndex);
          reorderItemsInContainer(sourceContainerId, newItems);
        }
      } else if (sourceContainerId !== targetContainerId) {
        // Move between containers
        moveItem(activeId, sourceContainerId, targetContainerId, targetIndex);
      }
    },
    [currentList, activeDragType, findContainer, getContainerItems, moveItem, reorderTiers, reorderItemsInContainer]
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
    setActiveRow(null);
    setActiveDragType(null);
    setOverId(null);
  }, []);

  // Custom collision detection - filters valid drop targets based on what's being dragged
  const collisionDetection = useCallback((args: Parameters<typeof closestCenter>[0]) => {
    const { active } = args;
    const activeId = active.id as string;
    const isRowDrag = activeId.startsWith("row-");

    // Get collisions using pointer first, then rect
    let collisions = pointerWithin(args);
    if (collisions.length === 0) {
      collisions = rectIntersection(args);
    }

    // If dragging a row, only allow dropping on other rows
    if (isRowDrag) {
      return collisions.filter((collision) => {
        const targetId = collision.id as string;
        return targetId.startsWith("row-");
      });
    }

    // For items, filter out row droppables (items should drop on tiers, not rows)
    return collisions.filter((collision) => {
      const targetId = collision.id as string;
      // Items can drop on: tier zones, unassigned pool, or other items
      return !targetId.startsWith("row-");
    });
  }, []);

  if (!currentList) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const rowIds = currentList.rows.map((row) => `row-${row.id}`);

  const totalItems = currentList.rows.reduce((acc, row) => acc + row.items.length, 0) + currentList.unassignedItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-4 border-b">
        <div className="flex-1 w-full">
          <Input
            value={currentList.title}
            onChange={(e) => updateList({ title: e.target.value })}
            className="text-xl sm:text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto hover:bg-muted/50 rounded-lg transition-colors -ml-2 pl-2"
            placeholder="Tier List Title"
          />
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 ml-0.5">
            {totalItems === 0
              ? "No items yet — upload some images to get started"
              : `${totalItems} item${totalItems === 1 ? "" : "s"} • ${currentList.rows.length} tiers`}
          </p>
        </div>
        <div className="flex gap-2 items-center justify-end">
          <ExportButton
            targetRef={exportRef}
            filename={currentList.title.toLowerCase().replace(/\s+/g, "-")}
            hasItems={currentList.rows.some((row) => row.items.length > 0)}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" title="Reset tier list" className="h-10 w-10 sm:h-9 sm:w-9 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Tier List?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all items from all tiers. This action cannot
                  be undone.
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
          className="rounded-xl border shadow-lg overflow-hidden bg-background"
        >
          {/* Title for export */}
          <div className="bg-gradient-to-r from-muted/80 to-muted/40 px-4 py-3 border-b">
            <h2 className="font-bold text-lg">{currentList.title}</h2>
          </div>

          {/* Tier Rows with Sortable Context for row reordering */}
          <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
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
          className="w-full border-dashed border-2 gap-2 hover:border-primary hover:bg-primary/5 transition-all group py-3"
          onClick={() => {
            const existingNames = currentList.rows.map(r => r.name);
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
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
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
      <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-[10px] sm:text-xs text-muted-foreground pt-4 border-t">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Drag</kbd>
          items to rank
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Tap</kbd>
          tier labels to rename
        </span>
        <span className="hidden sm:flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Hover</kbd>
          for more options
        </span>
      </div>
    </div>
  );
}
