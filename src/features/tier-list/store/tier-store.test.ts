import { describe, it, expect, beforeEach } from "vitest";
import { useTierStore } from "./tier-store";

describe("TierStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useTierStore.setState({
      tierLists: [],
      currentListId: null,
    });
  });

  describe("createList", () => {
    it("should create a new tier list with default tiers", () => {
      const { createList, tierLists, currentListId } = useTierStore.getState();

      const listId = createList("My Tier List");
      const state = useTierStore.getState();

      expect(state.tierLists).toHaveLength(1);
      expect(state.currentListId).toBe(listId);
      expect(state.tierLists[0].title).toBe("My Tier List");
      expect(state.tierLists[0].rows).toHaveLength(6); // S, A, B, C, D, F
      expect(state.tierLists[0].unassignedItems).toHaveLength(0);
    });

    it("should create multiple tier lists", () => {
      const { createList } = useTierStore.getState();

      createList("List 1");
      createList("List 2");

      const state = useTierStore.getState();
      expect(state.tierLists).toHaveLength(2);
      expect(state.tierLists[0].title).toBe("List 2"); // Most recent first
      expect(state.tierLists[1].title).toBe("List 1");
    });
  });

  describe("deleteList", () => {
    it("should delete a tier list", () => {
      const { createList, deleteList } = useTierStore.getState();

      const listId = createList("To Delete");
      expect(useTierStore.getState().tierLists).toHaveLength(1);

      deleteList(listId);

      const state = useTierStore.getState();
      expect(state.tierLists).toHaveLength(0);
      expect(state.currentListId).toBeNull();
    });

    it("should clear currentListId if deleted list was selected", () => {
      const { createList, deleteList } = useTierStore.getState();

      const listId = createList("Selected List");
      expect(useTierStore.getState().currentListId).toBe(listId);

      deleteList(listId);
      expect(useTierStore.getState().currentListId).toBeNull();
    });
  });

  describe("duplicateList", () => {
    it("should duplicate an existing tier list", () => {
      const { createList, duplicateList } = useTierStore.getState();

      const originalId = createList("Original");
      const duplicateId = duplicateList(originalId);

      const state = useTierStore.getState();
      expect(state.tierLists).toHaveLength(2);
      expect(duplicateId).not.toBe(originalId);
      expect(state.tierLists[0].title).toBe("Original (Copy)");
      expect(state.currentListId).toBe(duplicateId);
    });

    it("should return null for non-existent list", () => {
      const { duplicateList } = useTierStore.getState();
      const result = duplicateList("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("selectList", () => {
    it("should select a tier list", () => {
      const { createList, selectList } = useTierStore.getState();

      const list1 = createList("List 1");
      const list2 = createList("List 2");

      expect(useTierStore.getState().currentListId).toBe(list2);

      selectList(list1);
      expect(useTierStore.getState().currentListId).toBe(list1);
    });
  });

  describe("updateList", () => {
    it("should update the current list title", () => {
      const { createList, updateList, getCurrentList } =
        useTierStore.getState();

      createList("Original Title");
      updateList({ title: "New Title" });

      const currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.title).toBe("New Title");
    });

    it("should not update if no list is selected", () => {
      const { updateList } = useTierStore.getState();
      updateList({ title: "New Title" });

      const state = useTierStore.getState();
      expect(state.tierLists).toHaveLength(0);
    });
  });

  describe("addItem", () => {
    it("should add an item to unassigned pool", () => {
      const { createList, addItem, getCurrentList } = useTierStore.getState();

      createList("Test List");
      addItem({ name: "Test Item", imageUrl: "http://example.com/img.png" });

      const currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.unassignedItems).toHaveLength(1);
      expect(currentList?.unassignedItems[0].name).toBe("Test Item");
    });

    it("should not add item if no list is selected", () => {
      const { addItem } = useTierStore.getState();
      addItem({ name: "Orphan Item" });

      const state = useTierStore.getState();
      expect(state.tierLists).toHaveLength(0);
    });
  });

  describe("moveItem", () => {
    it("should move item from unassigned to a tier", () => {
      const { createList, addItem, moveItem, getCurrentList } =
        useTierStore.getState();

      createList("Test List");
      addItem({ name: "Move Me" });

      let currentList = useTierStore.getState().getCurrentList();
      const itemId = currentList!.unassignedItems[0].id;
      const tierId = currentList!.rows[0].id; // S tier

      moveItem(itemId, null, tierId);

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.unassignedItems).toHaveLength(0);
      expect(currentList?.rows[0].items).toHaveLength(1);
      expect(currentList?.rows[0].items[0].name).toBe("Move Me");
    });

    it("should move item between tiers", () => {
      const { createList, addItem, moveItem, getCurrentList } =
        useTierStore.getState();

      createList("Test List");
      addItem({ name: "Move Me" });

      let currentList = useTierStore.getState().getCurrentList();
      const itemId = currentList!.unassignedItems[0].id;
      const sTierId = currentList!.rows[0].id;
      const aTierId = currentList!.rows[1].id;

      // Move to S tier first
      moveItem(itemId, null, sTierId);
      // Then move to A tier
      moveItem(itemId, sTierId, aTierId);

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.rows[0].items).toHaveLength(0); // S tier empty
      expect(currentList?.rows[1].items).toHaveLength(1); // A tier has item
    });

    it("should move item back to unassigned pool", () => {
      const { createList, addItem, moveItem, getCurrentList } =
        useTierStore.getState();

      createList("Test List");
      addItem({ name: "Move Me" });

      let currentList = useTierStore.getState().getCurrentList();
      const itemId = currentList!.unassignedItems[0].id;
      const tierId = currentList!.rows[0].id;

      moveItem(itemId, null, tierId);
      moveItem(itemId, tierId, null);

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.unassignedItems).toHaveLength(1);
      expect(currentList?.rows[0].items).toHaveLength(0);
    });
  });

  describe("deleteItem", () => {
    it("should delete an item from unassigned pool", () => {
      const { createList, addItem, deleteItem, getCurrentList } =
        useTierStore.getState();

      createList("Test List");
      addItem({ name: "Delete Me" });

      let currentList = useTierStore.getState().getCurrentList();
      const itemId = currentList!.unassignedItems[0].id;

      deleteItem(itemId);

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.unassignedItems).toHaveLength(0);
    });

    it("should delete an item from a tier", () => {
      const { createList, addItem, moveItem, deleteItem, getCurrentList } =
        useTierStore.getState();

      createList("Test List");
      addItem({ name: "Delete Me" });

      let currentList = useTierStore.getState().getCurrentList();
      const itemId = currentList!.unassignedItems[0].id;
      const tierId = currentList!.rows[0].id;

      moveItem(itemId, null, tierId);
      deleteItem(itemId);

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.rows[0].items).toHaveLength(0);
    });
  });

  describe("updateTier", () => {
    it("should update tier name", () => {
      const { createList, updateTier, getCurrentList } =
        useTierStore.getState();

      createList("Test List");

      let currentList = useTierStore.getState().getCurrentList();
      const tierId = currentList!.rows[0].id;

      updateTier(tierId, { name: "Super Tier" });

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.rows[0].name).toBe("Super Tier");
    });

    it("should update tier color", () => {
      const { createList, updateTier, getCurrentList } =
        useTierStore.getState();

      createList("Test List");

      let currentList = useTierStore.getState().getCurrentList();
      const tierId = currentList!.rows[0].id;

      updateTier(tierId, { color: "#FF0000" });

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.rows[0].color).toBe("#FF0000");
    });
  });

  describe("deleteTier", () => {
    it("should delete a tier and move items to unassigned", () => {
      const { createList, addItem, moveItem, deleteTier, getCurrentList } =
        useTierStore.getState();

      createList("Test List");
      addItem({ name: "Item 1" });

      let currentList = useTierStore.getState().getCurrentList();
      const itemId = currentList!.unassignedItems[0].id;
      const tierId = currentList!.rows[0].id;

      moveItem(itemId, null, tierId);
      expect(
        useTierStore.getState().getCurrentList()?.rows[0].items
      ).toHaveLength(1);

      deleteTier(tierId);

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.rows).toHaveLength(5); // One tier removed
      expect(currentList?.unassignedItems).toHaveLength(1); // Item moved back
    });
  });

  describe("clearAllItems", () => {
    it("should clear all items from all tiers and unassigned", () => {
      const { createList, addItem, moveItem, clearAllItems, getCurrentList } =
        useTierStore.getState();

      createList("Test List");
      addItem({ name: "Item 1" });
      addItem({ name: "Item 2" });

      let currentList = useTierStore.getState().getCurrentList();
      const item1Id = currentList!.unassignedItems[0].id;
      const tierId = currentList!.rows[0].id;

      moveItem(item1Id, null, tierId);

      clearAllItems();

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.unassignedItems).toHaveLength(0);
      expect(currentList?.rows.every((row) => row.items.length === 0)).toBe(
        true
      );
    });
  });

  // dragState tests removed - moved to separate drag-store.ts

  describe("reorderTiers", () => {
    it("should reorder tiers", () => {
      const { createList, reorderTiers, getCurrentList } =
        useTierStore.getState();

      createList("Test List");

      let currentList = useTierStore.getState().getCurrentList();
      const originalFirstTier = currentList!.rows[0].level;
      const originalSecondTier = currentList!.rows[1].level;

      reorderTiers(0, 1);

      currentList = useTierStore.getState().getCurrentList();
      expect(currentList?.rows[0].level).toBe(originalSecondTier);
      expect(currentList?.rows[1].level).toBe(originalFirstTier);
    });
  });
});
