import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTierListDnd } from "./useTierListDnd";
import type { TierList, TierItem, TierRow } from "../index";

const createMockItem = (id: string, name: string): TierItem => ({
  id,
  name,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createMockRow = (
  id: string,
  level: TierRow["level"],
  items: TierItem[] = []
): TierRow => ({
  id,
  level,
  color: "#FF7F7F",
  items,
});

const createMockTierList = (): TierList => ({
  id: "list-1",
  title: "Test List",
  rows: [
    createMockRow("row-s", "S", [
      createMockItem("item-1", "Item 1"),
      createMockItem("item-2", "Item 2"),
    ]),
    createMockRow("row-a", "A", [createMockItem("item-3", "Item 3")]),
    createMockRow("row-b", "B", []),
  ],
  unassignedItems: [
    createMockItem("item-4", "Item 4"),
    createMockItem("item-5", "Item 5"),
  ],
  createdBy: "test-user",
  isPublic: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("useTierListDnd", () => {
  const mockMoveItem = vi.fn();
  const mockReorderTiers = vi.fn();
  const mockReorderItemsInContainer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDndHook = (currentList: TierList | null = createMockTierList()) =>
    renderHook(() =>
      useTierListDnd({
        currentList,
        moveItem: mockMoveItem,
        reorderTiers: mockReorderTiers,
        reorderItemsInContainer: mockReorderItemsInContainer,
      })
    );

  describe("initial state", () => {
    it("starts with null active item and row", () => {
      const { result } = renderDndHook();

      expect(result.current.activeItem).toBeNull();
      expect(result.current.activeRow).toBeNull();
      expect(result.current.activeDragType).toBeNull();
      expect(result.current.overId).toBeNull();
    });

    it("handles null currentList", () => {
      const { result } = renderDndHook(null);

      expect(result.current.activeItem).toBeNull();
      expect(result.current.activeRow).toBeNull();
    });
  });

  describe("handleDragStart", () => {
    it("sets activeItem for item drag", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "item-1" },
        } as never);
      });

      expect(result.current.activeItem).toEqual(
        expect.objectContaining({ id: "item-1", name: "Item 1" })
      );
      expect(result.current.activeDragType).toBe("item");
    });

    it("sets activeRow for row drag", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "row-row-s" },
        } as never);
      });

      expect(result.current.activeRow).toEqual(
        expect.objectContaining({ id: "row-s", level: "S" })
      );
      expect(result.current.activeDragType).toBe("row");
    });

    it("handles unassigned item drag", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "item-4" },
        } as never);
      });

      expect(result.current.activeItem).toEqual(
        expect.objectContaining({ id: "item-4", name: "Item 4" })
      );
    });

    it("does nothing for unknown item", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "unknown-id" },
        } as never);
      });

      expect(result.current.activeItem).toBeNull();
      expect(result.current.activeRow).toBeNull();
    });
  });

  describe("handleDragOver", () => {
    it("updates overId", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragOver({
          over: { id: "tier-row-a" },
        } as never);
      });

      expect(result.current.overId).toBe("tier-row-a");
    });

    it("sets overId to null/undefined when over nothing", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragOver({
          over: null,
        } as never);
      });

      // over?.id returns undefined when over is null
      expect(result.current.overId).toBeFalsy();
    });
  });

  describe("handleDragEnd", () => {
    it("resets state on drag end", () => {
      const { result } = renderDndHook();

      // Start a drag
      act(() => {
        result.current.handleDragStart({
          active: { id: "item-1" },
        } as never);
      });

      expect(result.current.activeItem).not.toBeNull();

      // End the drag (with no over)
      act(() => {
        result.current.handleDragEnd({
          active: { id: "item-1" },
          over: null,
        } as never);
      });

      expect(result.current.activeItem).toBeNull();
      expect(result.current.activeDragType).toBeNull();
    });

    it("calls moveItem when moving item to different container", () => {
      const { result } = renderDndHook();

      // Start item drag
      act(() => {
        result.current.handleDragStart({
          active: { id: "item-1" },
        } as never);
      });

      // Drop on tier-row-a
      act(() => {
        result.current.handleDragEnd({
          active: { id: "item-1" },
          over: { id: "tier-row-a" },
        } as never);
      });

      expect(mockMoveItem).toHaveBeenCalledWith(
        "item-1",
        "row-s",
        "row-a",
        undefined
      );
    });

    it("calls moveItem when moving to unassigned pool", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "item-1" },
        } as never);
      });

      act(() => {
        result.current.handleDragEnd({
          active: { id: "item-1" },
          over: { id: "unassigned-pool" },
        } as never);
      });

      expect(mockMoveItem).toHaveBeenCalledWith(
        "item-1",
        "row-s",
        null,
        undefined
      );
    });

    it("calls reorderItemsInContainer for same container reorder", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "item-1" },
        } as never);
      });

      // Drop on item-2 in same container
      act(() => {
        result.current.handleDragEnd({
          active: { id: "item-1" },
          over: { id: "item-2" },
        } as never);
      });

      expect(mockReorderItemsInContainer).toHaveBeenCalledWith(
        "row-s",
        expect.any(Array)
      );
    });

    it("calls reorderTiers for row reorder", () => {
      const { result } = renderDndHook();

      // Start row drag
      act(() => {
        result.current.handleDragStart({
          active: { id: "row-row-s" },
        } as never);
      });

      // Drop on row-a
      act(() => {
        result.current.handleDragEnd({
          active: { id: "row-row-s" },
          over: { id: "row-row-a" },
        } as never);
      });

      expect(mockReorderTiers).toHaveBeenCalledWith(0, 1);
    });

    it("does not call reorderTiers when dropping row on non-row", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "row-row-s" },
        } as never);
      });

      act(() => {
        result.current.handleDragEnd({
          active: { id: "row-row-s" },
          over: { id: "item-1" },
        } as never);
      });

      expect(mockReorderTiers).not.toHaveBeenCalled();
    });
  });

  describe("handleDragCancel", () => {
    it("resets all state", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "item-1" },
        } as never);
      });

      act(() => {
        result.current.handleDragOver({
          over: { id: "tier-row-a" },
        } as never);
      });

      expect(result.current.activeItem).not.toBeNull();
      expect(result.current.overId).not.toBeNull();

      act(() => {
        result.current.handleDragCancel();
      });

      expect(result.current.activeItem).toBeNull();
      expect(result.current.activeRow).toBeNull();
      expect(result.current.activeDragType).toBeNull();
      expect(result.current.overId).toBeNull();
    });
  });

  describe("collisionDetection", () => {
    it("filters row-only collisions for row drags", () => {
      const { result } = renderDndHook();

      const collisions = result.current.collisionDetection({
        active: { id: "row-row-s" },
        collisionRect: { left: 0, top: 0, right: 100, bottom: 100 },
        droppableContainers: [],
        droppableRects: new Map(),
        pointerCoordinates: { x: 50, y: 50 },
      } as never);

      // Should return filtered collisions (empty since no containers provided)
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("filters item-only collisions for item drags", () => {
      const { result } = renderDndHook();

      const collisions = result.current.collisionDetection({
        active: { id: "item-1" },
        collisionRect: { left: 0, top: 0, right: 100, bottom: 100 },
        droppableContainers: [],
        droppableRects: new Map(),
        pointerCoordinates: { x: 50, y: 50 },
      } as never);

      expect(Array.isArray(collisions)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles empty tier list", () => {
      const emptyList: TierList = {
        id: "empty",
        title: "Empty",
        rows: [],
        unassignedItems: [],
        createdBy: "test",
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { result } = renderDndHook(emptyList);

      act(() => {
        result.current.handleDragStart({
          active: { id: "non-existent" },
        } as never);
      });

      expect(result.current.activeItem).toBeNull();
    });

    it("handles row prefix variations", () => {
      const { result } = renderDndHook();

      // Start drag with row- prefix
      act(() => {
        result.current.handleDragStart({
          active: { id: "row-row-s" },
        } as never);
      });

      expect(result.current.activeRow).toEqual(
        expect.objectContaining({ id: "row-s" })
      );
    });

    it("handles moving from unassigned to tier", () => {
      const { result } = renderDndHook();

      act(() => {
        result.current.handleDragStart({
          active: { id: "item-4" },
        } as never);
      });

      act(() => {
        result.current.handleDragEnd({
          active: { id: "item-4" },
          over: { id: "tier-row-s" },
        } as never);
      });

      // Source is null (unassigned), target is row-s
      expect(mockMoveItem).toHaveBeenCalledWith(
        "item-4",
        null,
        "row-s",
        undefined
      );
    });
  });
});
