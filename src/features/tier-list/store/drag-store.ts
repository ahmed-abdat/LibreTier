import { create } from "zustand";
import { DragState } from "../index";

interface DragStore extends DragState {
  setDragState: (state: Partial<DragState>) => void;
  resetDragState: () => void;
}

const initialDragState: DragState = {
  isDragging: false,
  draggedItemId: undefined,
  sourceRowId: undefined,
  targetRowId: undefined,
};

export const useDragStore = create<DragStore>((set) => ({
  ...initialDragState,

  setDragState: (dragState) =>
    set((prev) => ({
      ...prev,
      ...dragState,
    })),

  resetDragState: () =>
    set(initialDragState),
}));
