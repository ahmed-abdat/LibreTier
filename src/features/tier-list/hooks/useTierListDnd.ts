import { useState, useCallback, useMemo } from "react";
import {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  pointerWithin,
  rectIntersection,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TierItem, TierRow, TierList } from "../index";

type ActiveDragType = "item" | "row" | null;

interface UseTierListDndProps {
  currentList: TierList | null;
  moveItem: (
    itemId: string,
    sourceTierId: string | null,
    targetTierId: string | null,
    targetIndex?: number
  ) => void;
  reorderTiers: (sourceIndex: number, destinationIndex: number) => void;
  reorderItemsInContainer: (
    containerId: string | null,
    items: TierItem[]
  ) => void;
}

export function useTierListDnd({
  currentList,
  moveItem,
  reorderTiers,
  reorderItemsInContainer,
}: UseTierListDndProps) {
  const [activeItem, setActiveItem] = useState<TierItem | null>(null);
  const [activeRow, setActiveRow] = useState<TierRow | null>(null);
  const [activeDragType, setActiveDragType] = useState<ActiveDragType>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // O(1) lookup maps - rebuilt only when currentList changes
  const { itemMap, itemContainerMap, rowMap } = useMemo(() => {
    const itemMap = new Map<string, TierItem>();
    const itemContainerMap = new Map<string, string | null>();
    const rowMap = new Map<string, TierRow>();

    if (!currentList) {
      return { itemMap, itemContainerMap, rowMap };
    }

    // Map unassigned items
    currentList.unassignedItems.forEach((item) => {
      itemMap.set(item.id, item);
      itemContainerMap.set(item.id, null);
    });

    // Map tier items and rows
    currentList.rows.forEach((row) => {
      rowMap.set(row.id, row);
      row.items.forEach((item) => {
        itemMap.set(item.id, item);
        itemContainerMap.set(item.id, row.id);
      });
    });

    return { itemMap, itemContainerMap, rowMap };
  }, [currentList]);

  // Find which container (tier or pool) an item belongs to - O(1)
  const findContainer = useCallback(
    (id: string): string | null => {
      if (!currentList) return null;

      if (id === "unassigned-pool") return null;
      if (id.startsWith("tier-")) {
        const tierId = id.replace("tier-", "");
        if (rowMap.has(tierId)) return tierId;
      }
      if (id.startsWith("row-")) return id;

      // O(1) lookup for items via map
      if (itemContainerMap.has(id)) {
        const containerId = itemContainerMap.get(id);
        return containerId === null ? "unassigned" : (containerId ?? null);
      }

      return null;
    },
    [currentList, itemContainerMap, rowMap]
  );

  // Find an item by ID - O(1)
  const findItem = useCallback(
    (id: string): TierItem | undefined => {
      return itemMap.get(id);
    },
    [itemMap]
  );

  // Find a row by ID - O(1)
  const findRow = useCallback(
    (id: string): TierRow | undefined => {
      const rowId = id.startsWith("row-") ? id.replace("row-", "") : id;
      return rowMap.get(rowId);
    },
    [rowMap]
  );

  // Get items for a container
  const getContainerItems = useCallback(
    (containerId: string | null): TierItem[] => {
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

      if (activeId.startsWith("row-")) {
        const row = findRow(activeId);
        if (row) {
          setActiveRow(row);
          setActiveDragType("row");
        }
        return;
      }

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
      // Only update visual feedback (overId) - don't move items during drag
      // Actual moves happen in handleDragEnd when undo history is resumed
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

      // Handle row reordering
      if (wasRowDrag) {
        if (!overId.startsWith("row-")) return;

        const activeRowId = activeId.replace("row-", "");
        const overRowId = overId.replace("row-", "");

        const activeIndex = currentList.rows.findIndex(
          (r) => r.id === activeRowId
        );
        const overIndex = currentList.rows.findIndex((r) => r.id === overRowId);

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          reorderTiers(activeIndex, overIndex);
        }
        return;
      }

      // Handle item dragging
      let sourceContainerId = findContainer(activeId);
      if (sourceContainerId === "unassigned") sourceContainerId = null;

      let targetContainerId: string | null = null;
      let targetIndex: number | undefined;

      if (overId === "unassigned-pool") {
        targetContainerId = null;
      } else if (overId.startsWith("tier-")) {
        targetContainerId = overId.replace("tier-", "");
      } else if (overId.startsWith("row-")) {
        targetContainerId = overId.replace("row-", "");
      } else {
        const overContainer = findContainer(overId);
        targetContainerId =
          overContainer === "unassigned" ? null : overContainer;

        const containerItems = getContainerItems(
          overContainer === "unassigned" ? null : overContainer
        );
        const overIndex = containerItems.findIndex(
          (item) => item.id === overId
        );
        if (overIndex !== -1) {
          targetIndex = overIndex;
        }
      }

      // Same container - reorder
      if (
        sourceContainerId === targetContainerId &&
        targetIndex !== undefined
      ) {
        const containerItems = getContainerItems(sourceContainerId);
        const activeIndex = containerItems.findIndex(
          (item) => item.id === activeId
        );

        if (activeIndex !== -1 && activeIndex !== targetIndex) {
          const newItems = arrayMove(containerItems, activeIndex, targetIndex);
          reorderItemsInContainer(sourceContainerId, newItems);
        }
      } else if (sourceContainerId !== targetContainerId) {
        moveItem(activeId, sourceContainerId, targetContainerId, targetIndex);
      }
    },
    [
      currentList,
      activeDragType,
      findContainer,
      getContainerItems,
      moveItem,
      reorderTiers,
      reorderItemsInContainer,
    ]
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
    setActiveRow(null);
    setActiveDragType(null);
    setOverId(null);
  }, []);

  // Custom collision detection
  const collisionDetection = useCallback(
    (args: Parameters<typeof closestCenter>[0]) => {
      const { active } = args;
      const activeId = active.id as string;
      const isRowDrag = activeId.startsWith("row-");

      let collisions = pointerWithin(args);
      if (collisions.length === 0) {
        collisions = rectIntersection(args);
      }

      if (isRowDrag) {
        return collisions.filter((collision) => {
          const targetId = collision.id as string;
          return targetId.startsWith("row-");
        });
      }

      return collisions.filter((collision) => {
        const targetId = collision.id as string;
        return !targetId.startsWith("row-");
      });
    },
    []
  );

  return {
    activeItem,
    activeRow,
    activeDragType,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    collisionDetection,
  };
}
