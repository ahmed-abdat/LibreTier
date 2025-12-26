import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStore } from "zustand";
import { temporal, TemporalState } from "zundo";
import { v4 as uuidv4 } from "uuid";
import pako from "pako";
import { toast } from "sonner";
import { TierLevel, TIER_COLORS, TIER_LEVELS } from "../constants";
import { TierItem, TierRow, TierList } from "../index";

interface TierStore {
  // State
  tierLists: TierList[]; // All saved tier lists
  currentListId: string | null; // Currently editing list

  // Computed
  getCurrentList: () => TierList | null;

  // List Management Actions
  createList: (title: string) => string; // Returns the new list ID
  duplicateList: (id: string) => string | null;
  deleteList: (id: string) => void;
  selectList: (id: string) => void;
  updateList: (updates: Partial<TierList>) => void;
  clearCurrentList: () => void;

  // Tier Actions
  addTier: (level: TierLevel) => void;
  addCustomTier: (name: string, color: string) => void;
  updateTier: (id: string, updates: Partial<Omit<TierRow, "id">>) => void;
  deleteTier: (id: string) => void;
  clearTierItems: (id: string) => void;
  reorderTiers: (sourceIndex: number, destinationIndex: number) => void;

  // Item Actions
  addItem: (item: Omit<TierItem, "id" | "createdAt" | "updatedAt">) => void;
  addItemToTier: (
    tierId: string,
    item: Omit<TierItem, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateItem: (id: string, updates: Partial<Omit<TierItem, "id">>) => void;
  deleteItem: (id: string) => void;
  moveItem: (
    itemId: string,
    sourceTierId: string | null,
    targetTierId: string | null,
    targetIndex?: number
  ) => void;
  reorderItemsInContainer: (
    containerId: string | null,
    items: TierItem[]
  ) => void;
  clearAllItems: () => void;
}

// Helper to create a new tier list
const createNewTierList = (title: string): TierList => ({
  id: uuidv4(),
  title,
  rows: TIER_LEVELS.map((level) => ({
    id: uuidv4(),
    level,
    color: TIER_COLORS[level],
    items: [],
    name: level,
  })),
  unassignedItems: [],
  createdBy: "local-user",
  isPublic: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Type for partialized state (only what we track in history)
type PartializedTierState = Pick<TierStore, "tierLists">;

export const useTierStore = create<TierStore>()(
  persist(
    temporal(
      (set, get) => ({
        // Initial State
        tierLists: [],
        currentListId: null,

        // Computed - Get current list
        getCurrentList: () => {
          const { tierLists, currentListId } = get();
          if (!currentListId) return null;
          return tierLists.find((list) => list.id === currentListId) || null;
        },

        // List Management Actions
        createList: (title) => {
          const newList = createNewTierList(title);
          set((state) => ({
            tierLists: [newList, ...state.tierLists],
            currentListId: newList.id,
          }));
          return newList.id;
        },

        duplicateList: (id) => {
          const { tierLists } = get();
          const listToDuplicate = tierLists.find((list) => list.id === id);
          if (!listToDuplicate) return null;

          // Deep clone with new IDs to avoid reference issues
          const newList: TierList = {
            id: uuidv4(),
            title: `${listToDuplicate.title} (Copy)`,
            rows: listToDuplicate.rows.map((row) => ({
              ...row,
              id: uuidv4(),
              items: row.items.map((item) => ({
                ...item,
                id: uuidv4(),
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(),
              })),
            })),
            unassignedItems: listToDuplicate.unassignedItems.map((item) => ({
              ...item,
              id: uuidv4(),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(),
            })),
            createdBy: listToDuplicate.createdBy,
            isPublic: listToDuplicate.isPublic,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            tierLists: [newList, ...state.tierLists],
            currentListId: newList.id,
          }));
          return newList.id;
        },

        deleteList: (id) =>
          set((state) => ({
            tierLists: state.tierLists.filter((list) => list.id !== id),
            currentListId:
              state.currentListId === id ? null : state.currentListId,
          })),

        selectList: (id) => set({ currentListId: id }),

        clearCurrentList: () => set({ currentListId: null }),

        updateList: (updates) =>
          set((state) => {
            if (!state.currentListId) return state;

            // Validate title if provided
            if (updates.title !== undefined) {
              // Only reject if entirely whitespace
              if (!updates.title.trim()) return state;
              // Allow spaces while typing, just limit length
              updates = { ...updates, title: updates.title.slice(0, 200) };
            }

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? { ...list, ...updates, updatedAt: new Date() }
                  : list
              ),
            };
          }),

        // Tier Actions
        addTier: (level) =>
          set((state) => {
            if (!state.currentListId) return state;

            const newTier: TierRow = {
              id: uuidv4(),
              level,
              color: TIER_COLORS[level] || "#808080",
              items: [],
              name: level,
            };

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      rows: [...list.rows, newTier],
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),

        addCustomTier: (name, color) =>
          set((state) => {
            if (!state.currentListId) return state;

            // Validate name
            const trimmedName = name.trim();
            if (!trimmedName) return state;

            // Validate color (must be valid hex)
            const hexRegex = /^#[0-9A-Fa-f]{6}$/;
            if (!hexRegex.test(color)) return state;

            const newTier: TierRow = {
              id: uuidv4(),
              level: "C" as TierLevel, // Default level
              color,
              items: [],
              name: trimmedName.slice(0, 10),
            };

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      rows: [...list.rows, newTier],
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),

        updateTier: (id, updates) =>
          set((state) => {
            if (!state.currentListId) return state;

            // Validate name if provided
            if (updates.name !== undefined) {
              const trimmedName = updates.name.trim();
              if (!trimmedName) return state; // Reject empty names
              updates = { ...updates, name: trimmedName.slice(0, 100) };
            }

            // Validate color if provided (must be valid hex)
            if (updates.color !== undefined) {
              const hexRegex = /^#[0-9A-Fa-f]{6}$/;
              if (!hexRegex.test(updates.color)) return state;
            }

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      rows: list.rows.map((row) =>
                        row.id === id ? { ...row, ...updates } : row
                      ),
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),

        deleteTier: (id) =>
          set((state) => {
            if (!state.currentListId) return state;

            const currentList = state.tierLists.find(
              (l) => l.id === state.currentListId
            );
            if (!currentList) return state;

            const tierToDelete = currentList.rows.find((row) => row.id === id);
            const itemsToMove = tierToDelete?.items || [];

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      rows: list.rows.filter((row) => row.id !== id),
                      unassignedItems: [
                        ...list.unassignedItems,
                        ...itemsToMove,
                      ],
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),

        clearTierItems: (id) =>
          set((state) => {
            if (!state.currentListId) return state;

            const currentList = state.tierLists.find(
              (l) => l.id === state.currentListId
            );
            if (!currentList) return state;

            const tierToClear = currentList.rows.find((row) => row.id === id);
            const itemsToMove = tierToClear?.items || [];

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      rows: list.rows.map((row) =>
                        row.id === id ? { ...row, items: [] } : row
                      ),
                      unassignedItems: [
                        ...list.unassignedItems,
                        ...itemsToMove,
                      ],
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),

        reorderTiers: (sourceIndex, destinationIndex) =>
          set((state) => {
            if (!state.currentListId) return state;

            return {
              tierLists: state.tierLists.map((list) => {
                if (list.id !== state.currentListId) return list;

                const newRows = [...list.rows];
                const [removed] = newRows.splice(sourceIndex, 1);
                newRows.splice(destinationIndex, 0, removed);

                return {
                  ...list,
                  rows: newRows,
                  updatedAt: new Date(),
                };
              }),
            };
          }),

        // Item Actions
        addItem: (item) =>
          set((state) => {
            if (!state.currentListId) return state;

            const newItem: TierItem = {
              id: uuidv4(),
              ...item,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      unassignedItems: [...list.unassignedItems, newItem],
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),

        addItemToTier: (tierId, item) =>
          set((state) => {
            if (!state.currentListId) return state;

            const newItem: TierItem = {
              id: uuidv4(),
              ...item,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      rows: list.rows.map((row) =>
                        row.id === tierId
                          ? { ...row, items: [...row.items, newItem] }
                          : row
                      ),
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),

        updateItem: (id, updates) =>
          set((state) => {
            if (!state.currentListId) return state;

            return {
              tierLists: state.tierLists.map((list) => {
                if (list.id !== state.currentListId) return list;

                const inUnassigned = list.unassignedItems.some(
                  (item) => item.id === id
                );

                if (inUnassigned) {
                  return {
                    ...list,
                    unassignedItems: list.unassignedItems.map((item) =>
                      item.id === id
                        ? { ...item, ...updates, updatedAt: new Date() }
                        : item
                    ),
                    updatedAt: new Date(),
                  };
                }

                return {
                  ...list,
                  rows: list.rows.map((row) => ({
                    ...row,
                    items: row.items.map((item) =>
                      item.id === id
                        ? { ...item, ...updates, updatedAt: new Date() }
                        : item
                    ),
                  })),
                  updatedAt: new Date(),
                };
              }),
            };
          }),

        deleteItem: (id) =>
          set((state) => {
            if (!state.currentListId) return state;

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      unassignedItems: list.unassignedItems.filter(
                        (item) => item.id !== id
                      ),
                      rows: list.rows.map((row) => ({
                        ...row,
                        items: row.items.filter((item) => item.id !== id),
                      })),
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),

        moveItem: (itemId, sourceTierId, targetTierId, targetIndex) =>
          set((state) => {
            if (!state.currentListId) return state;

            return {
              tierLists: state.tierLists.map((list) => {
                if (list.id !== state.currentListId) return list;

                let itemToMove: TierItem | undefined;
                let newUnassignedItems = [...list.unassignedItems];
                let newRows = [...list.rows];

                // Find and remove item from source
                if (sourceTierId === null) {
                  itemToMove = newUnassignedItems.find((i) => i.id === itemId);
                  newUnassignedItems = newUnassignedItems.filter(
                    (i) => i.id !== itemId
                  );
                } else {
                  newRows = newRows.map((row) => {
                    if (row.id === sourceTierId) {
                      itemToMove = row.items.find((i) => i.id === itemId);
                      return {
                        ...row,
                        items: row.items.filter((i) => i.id !== itemId),
                      };
                    }
                    return row;
                  });
                }

                if (!itemToMove) return list;

                // Add item to target
                if (targetTierId === null) {
                  if (targetIndex !== undefined) {
                    newUnassignedItems.splice(targetIndex, 0, itemToMove);
                  } else {
                    newUnassignedItems.push(itemToMove);
                  }
                } else {
                  newRows = newRows.map((row) => {
                    if (row.id === targetTierId) {
                      const newItems = [...row.items];
                      if (targetIndex !== undefined) {
                        newItems.splice(targetIndex, 0, itemToMove!);
                      } else {
                        newItems.push(itemToMove!);
                      }
                      return { ...row, items: newItems };
                    }
                    return row;
                  });
                }

                return {
                  ...list,
                  rows: newRows,
                  unassignedItems: newUnassignedItems,
                  updatedAt: new Date(),
                };
              }),
            };
          }),

        reorderItemsInContainer: (containerId, items) =>
          set((state) => {
            if (!state.currentListId) return state;

            return {
              tierLists: state.tierLists.map((list) => {
                if (list.id !== state.currentListId) return list;

                if (containerId === null) {
                  // Reorder unassigned items
                  return {
                    ...list,
                    unassignedItems: items,
                    updatedAt: new Date(),
                  };
                }

                // Reorder tier items
                return {
                  ...list,
                  rows: list.rows.map((row) =>
                    row.id === containerId ? { ...row, items } : row
                  ),
                  updatedAt: new Date(),
                };
              }),
            };
          }),

        clearAllItems: () =>
          set((state) => {
            if (!state.currentListId) return state;

            return {
              tierLists: state.tierLists.map((list) =>
                list.id === state.currentListId
                  ? {
                      ...list,
                      rows: list.rows.map((row) => ({
                        ...row,
                        items: [],
                      })),
                      unassignedItems: [],
                      updatedAt: new Date(),
                    }
                  : list
              ),
            };
          }),
      }),
      {
        // Only track tierLists changes, not currentListId
        partialize: (state): PartializedTierState => ({
          tierLists: state.tierLists,
        }),
        // Limit history to 50 steps to prevent memory bloat
        limit: 50,
      }
    ),
    {
      name: "tier-list-storage",
      partialize: (state) => ({
        tierLists: state.tierLists,
        currentListId: state.currentListId,
      }),
      storage: {
        getItem: (name) => {
          // Skip on server (SSR)
          if (typeof window === "undefined") return null;
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;

            let data;
            // Try decompressing (new format)
            try {
              const compressed = Uint8Array.from(atob(str), c => c.charCodeAt(0));
              const decompressed = pako.inflate(compressed, { to: 'string' });
              data = JSON.parse(decompressed);
            } catch (compressionError) {
              // Fallback to uncompressed (legacy format)
              console.warn(
                "Failed to decompress storage, using legacy format:",
                compressionError instanceof Error ? compressionError.message : compressionError
              );
              data = JSON.parse(str);
            }

            // Revive Date objects from ISO strings
            if (data.state?.tierLists) {
              data.state.tierLists = data.state.tierLists.map(
                (list: TierList) => ({
                  ...list,
                  createdAt: new Date(list.createdAt),
                  updatedAt: new Date(list.updatedAt),
                  unassignedItems: list.unassignedItems.map(
                    (item: TierItem) => ({
                      ...item,
                      createdAt: new Date(item.createdAt),
                      updatedAt: new Date(item.updatedAt),
                    })
                  ),
                  rows: list.rows.map((row: TierRow) => ({
                    ...row,
                    items: row.items.map((item: TierItem) => ({
                      ...item,
                      createdAt: new Date(item.createdAt),
                      updatedAt: new Date(item.updatedAt),
                    })),
                  })),
                })
              );
            }
            return data;
          } catch (error) {
            console.error("Failed to parse localStorage data:", error);
            console.warn(
              "Tier list data was corrupted and will be reset. Consider exporting your lists regularly."
            );
            try {
              localStorage.removeItem(name);
            } catch {
              // Storage may be restricted
            }
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          try {
            const json = JSON.stringify(value);
            // Compress using pako (60-70% size reduction)
            const compressed = pako.deflate(json);
            // Convert to base64 in chunks to avoid call stack limit
            let binary = '';
            for (let i = 0; i < compressed.length; i++) {
              binary += String.fromCharCode(compressed[i]);
            }
            const base64 = btoa(binary);
            localStorage.setItem(name, base64);
          } catch (error) {
            console.error("Failed to save to localStorage:", error);
            if (error instanceof Error && error.name === "QuotaExceededError") {
              toast.error("Storage full. Delete old tier lists to save changes.");
            } else {
              toast.error("Failed to save. Your changes may not persist.");
            }
          }
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.removeItem(name);
          } catch {
            // Storage may be restricted in private browsing
          }
        },
      },
    }
  )
);

// Hook for reactive temporal state (undo/redo button states)
export const useTemporalStore = <T>(
  selector: (state: TemporalState<PartializedTierState>) => T
): T => useStore(useTierStore.temporal, selector);

// Fine-grained selectors for performance optimization

/**
 * Stable action selectors - returns tier manipulation functions
 * These never change, so components using them won't re-render unless other props change
 */
export const useTierActions = () =>
  useTierStore((state) => ({
    updateTier: state.updateTier,
    deleteTier: state.deleteTier,
    clearTierItems: state.clearTierItems,
  }));

/**
 * Gallery metadata selector - returns only tierLists reference
 * Computation is done in the consuming component with useMemo
 */
export const useTierLists = () => useTierStore((state) => state.tierLists);
