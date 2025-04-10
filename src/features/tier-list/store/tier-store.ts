import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { TierLevel, TIER_COLORS, TIER_LEVELS } from "../constants";
import { TierItem, TierRow, TierList, DragState } from "../index";

interface TierStore {
  // State
  currentList: TierList | null;
  dragState: DragState;

  // List Actions
  createList: (title: string) => void;
  updateList: (updates: Partial<TierList>) => void;
  deleteList: () => void;

  // Tier Actions
  addTier: (level: TierLevel) => void;
  updateTier: (id: string, updates: Partial<Omit<TierRow, "id">>) => void;
  deleteTier: (id: string) => void;
  reorderTiers: (sourceIndex: number, destinationIndex: number) => void;

  // Item Actions
  addItem: (item: Omit<TierItem, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, updates: Partial<Omit<TierItem, "id">>) => void;
  deleteItem: (id: string) => void;
  moveItem: (
    itemId: string,
    sourceTierId: string | null,
    targetTierId: string | null
  ) => void;

  // Drag State Actions
  setDragState: (state: Partial<DragState>) => void;
  resetDragState: () => void;
}

const initialDragState: DragState = {
  isDragging: false,
  draggedItemId: undefined,
  sourceRowId: undefined,
  targetRowId: undefined,
};

export const useTierStore = create<TierStore>()(
  persist(
    (set) => ({
      // Initial State
      currentList: null,
      dragState: initialDragState,

      // List Actions
      createList: (title) =>
        set({
          currentList: {
            id: uuidv4(),
            title,
            rows: TIER_LEVELS.map((level) => ({
              id: uuidv4(),
              level,
              color: TIER_COLORS[level],
              items: [],
              name: level,
            })),
            createdBy: "user", // TODO: Replace with actual user ID
            isPublic: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),

      updateList: (updates) =>
        set((state) => ({
          currentList: state.currentList
            ? { ...state.currentList, ...updates, updatedAt: new Date() }
            : null,
        })),

      deleteList: () => set({ currentList: null }),

      // Tier Actions
      addTier: (level) =>
        set((state) => {
          if (!state.currentList) return state;

          const newTier: TierRow = {
            id: uuidv4(),
            level,
            color: TIER_COLORS[level] || "#808080",
            items: [],
            name: level,
          };

          return {
            currentList: {
              ...state.currentList,
              rows: [...state.currentList.rows, newTier],
              updatedAt: new Date(),
            },
          };
        }),

      updateTier: (id, updates) =>
        set((state) => {
          if (!state.currentList) return state;

          return {
            currentList: {
              ...state.currentList,
              rows: state.currentList.rows.map((row) =>
                row.id === id ? { ...row, ...updates } : row
              ),
              updatedAt: new Date(),
            },
          };
        }),

      deleteTier: (id) =>
        set((state) => {
          if (!state.currentList) return state;

          return {
            currentList: {
              ...state.currentList,
              rows: state.currentList.rows.filter((row) => row.id !== id),
              updatedAt: new Date(),
            },
          };
        }),

      reorderTiers: (sourceIndex, destinationIndex) =>
        set((state) => {
          if (!state.currentList) return state;

          const newRows = [...state.currentList.rows];
          const [removed] = newRows.splice(sourceIndex, 1);
          newRows.splice(destinationIndex, 0, removed);

          return {
            currentList: {
              ...state.currentList,
              rows: newRows,
              updatedAt: new Date(),
            },
          };
        }),

      // Item Actions
      addItem: (item) =>
        set((state) => {
          if (!state.currentList) return state;

          const newItem: TierItem = {
            id: uuidv4(),
            ...item,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            currentList: {
              ...state.currentList,
              rows: state.currentList.rows.map((row) => ({
                ...row,
                items: [...row.items, newItem],
              })),
              updatedAt: new Date(),
            },
          };
        }),

      updateItem: (id, updates) =>
        set((state) => {
          if (!state.currentList) return state;

          return {
            currentList: {
              ...state.currentList,
              rows: state.currentList.rows.map((row) => ({
                ...row,
                items: row.items.map((item) =>
                  item.id === id
                    ? { ...item, ...updates, updatedAt: new Date() }
                    : item
                ),
              })),
              updatedAt: new Date(),
            },
          };
        }),

      deleteItem: (id) =>
        set((state) => {
          if (!state.currentList) return state;

          return {
            currentList: {
              ...state.currentList,
              rows: state.currentList.rows.map((row) => ({
                ...row,
                items: row.items.filter((item) => item.id !== id),
              })),
              updatedAt: new Date(),
            },
          };
        }),

      moveItem: (itemId, sourceTierId, targetTierId) =>
        set((state) => {
          if (!state.currentList) return state;

          let itemToMove: TierItem | undefined;

          // Remove item from source tier
          const updatedRows = state.currentList.rows.map((row) => {
            if (row.id === sourceTierId) {
              const [item] = row.items.filter((i) => i.id === itemId);
              itemToMove = item;
              return {
                ...row,
                items: row.items.filter((i) => i.id !== itemId),
              };
            }
            return row;
          });

          if (!itemToMove) return state;

          // Add item to target tier
          return {
            currentList: {
              ...state.currentList,
              rows: updatedRows.map((row) =>
                row.id === targetTierId
                  ? { ...row, items: [...row.items, itemToMove!] }
                  : row
              ),
              updatedAt: new Date(),
            },
          };
        }),

      // Drag State Actions
      setDragState: (state) =>
        set((prev) => ({
          dragState: { ...prev.dragState, ...state },
        })),

      resetDragState: () =>
        set({
          dragState: initialDragState,
        }),
    }),
    {
      name: "tier-list-storage",
      // Only persist the currentList, not the dragState
      partialize: (state) => ({ currentList: state.currentList }),
    }
  )
);
