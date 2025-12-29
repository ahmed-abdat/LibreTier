import { describe, it, expect, beforeEach } from "vitest";
import { useDragStore } from "./drag-store";

describe("DragStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useDragStore.setState({
      isDragging: false,
      draggedItemId: undefined,
      sourceRowId: undefined,
      targetRowId: undefined,
    });
  });

  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useDragStore.getState();

      expect(state.isDragging).toBe(false);
      expect(state.draggedItemId).toBeUndefined();
      expect(state.sourceRowId).toBeUndefined();
      expect(state.targetRowId).toBeUndefined();
    });
  });

  describe("setDragState", () => {
    it("sets isDragging", () => {
      const { setDragState } = useDragStore.getState();

      setDragState({ isDragging: true });

      expect(useDragStore.getState().isDragging).toBe(true);
    });

    it("sets draggedItemId", () => {
      const { setDragState } = useDragStore.getState();

      setDragState({ draggedItemId: "item-123" });

      expect(useDragStore.getState().draggedItemId).toBe("item-123");
    });

    it("sets sourceRowId", () => {
      const { setDragState } = useDragStore.getState();

      setDragState({ sourceRowId: "row-s" });

      expect(useDragStore.getState().sourceRowId).toBe("row-s");
    });

    it("sets targetRowId", () => {
      const { setDragState } = useDragStore.getState();

      setDragState({ targetRowId: "row-a" });

      expect(useDragStore.getState().targetRowId).toBe("row-a");
    });

    it("sets multiple properties at once", () => {
      const { setDragState } = useDragStore.getState();

      setDragState({
        isDragging: true,
        draggedItemId: "item-1",
        sourceRowId: "row-s",
      });

      const state = useDragStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.draggedItemId).toBe("item-1");
      expect(state.sourceRowId).toBe("row-s");
      expect(state.targetRowId).toBeUndefined();
    });

    it("preserves existing state when setting partial updates", () => {
      const { setDragState } = useDragStore.getState();

      // Set initial drag state
      setDragState({
        isDragging: true,
        draggedItemId: "item-1",
        sourceRowId: "row-s",
      });

      // Update only targetRowId
      setDragState({ targetRowId: "row-a" });

      const state = useDragStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.draggedItemId).toBe("item-1");
      expect(state.sourceRowId).toBe("row-s");
      expect(state.targetRowId).toBe("row-a");
    });

    it("can clear values by setting undefined", () => {
      const { setDragState } = useDragStore.getState();

      setDragState({
        isDragging: true,
        draggedItemId: "item-1",
      });

      setDragState({ draggedItemId: undefined });

      expect(useDragStore.getState().draggedItemId).toBeUndefined();
      expect(useDragStore.getState().isDragging).toBe(true);
    });
  });

  describe("resetDragState", () => {
    it("resets all state to initial values", () => {
      const { setDragState, resetDragState } = useDragStore.getState();

      // Set some drag state
      setDragState({
        isDragging: true,
        draggedItemId: "item-123",
        sourceRowId: "row-s",
        targetRowId: "row-a",
      });

      // Verify state was set
      let state = useDragStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.draggedItemId).toBe("item-123");

      // Reset
      resetDragState();

      // Verify reset
      state = useDragStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.draggedItemId).toBeUndefined();
      expect(state.sourceRowId).toBeUndefined();
      expect(state.targetRowId).toBeUndefined();
    });

    it("can be called multiple times", () => {
      const { resetDragState } = useDragStore.getState();

      resetDragState();
      resetDragState();

      const state = useDragStore.getState();
      expect(state.isDragging).toBe(false);
    });
  });

  describe("drag flow simulation", () => {
    it("simulates a complete drag flow", () => {
      const { setDragState, resetDragState } = useDragStore.getState();

      // 1. Start dragging
      setDragState({
        isDragging: true,
        draggedItemId: "item-1",
        sourceRowId: "row-s",
      });

      expect(useDragStore.getState().isDragging).toBe(true);

      // 2. Drag over target
      setDragState({ targetRowId: "row-a" });

      expect(useDragStore.getState().targetRowId).toBe("row-a");

      // 3. Drop - reset state
      resetDragState();

      const state = useDragStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.draggedItemId).toBeUndefined();
    });

    it("handles drag from unassigned pool (sourceRowId undefined)", () => {
      const { setDragState } = useDragStore.getState();

      setDragState({
        isDragging: true,
        draggedItemId: "item-1",
        sourceRowId: undefined, // From unassigned pool
        targetRowId: "row-s",
      });

      const state = useDragStore.getState();
      expect(state.sourceRowId).toBeUndefined();
      expect(state.targetRowId).toBe("row-s");
    });

    it("handles drag to unassigned pool (targetRowId undefined)", () => {
      const { setDragState } = useDragStore.getState();

      setDragState({
        isDragging: true,
        draggedItemId: "item-1",
        sourceRowId: "row-s",
        targetRowId: undefined, // To unassigned pool
      });

      const state = useDragStore.getState();
      expect(state.sourceRowId).toBe("row-s");
      expect(state.targetRowId).toBeUndefined();
    });
  });
});
