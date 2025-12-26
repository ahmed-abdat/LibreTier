# Codebase Optimization & Cleanup Plan

## Overview
Comprehensive analysis of dead code, performance bottlenecks, and refactoring opportunities.

---

## 1. DEAD CODE REMOVAL (Quick Wins)

### Files to Delete
| File | Reason |
|------|--------|
| `src/components/ui/ColorBadge.tsx` | Never imported anywhere |
| `src/components/ui/CartCounter.tsx` | Never imported anywhere |

### Unused Exports to Remove

**`src/features/tier-list/index.ts`**
- Remove: `DragState`, `TierListConfig`, `TierListError` (never used)

**`src/features/tier-list/constants.ts`**
- Remove: `MAX_CUSTOM_TIERS`, `DEFAULT_TIER_LIST_TITLE`, `MAX_DESCRIPTION_LENGTH`, `DND_TYPES`

**`src/features/tier-list/store/tier-store.ts`**
- Remove unused `shallow` import (line 4)

---

## 2. CRITICAL PERFORMANCE FIXES

### P0 - Fix Broken Memoization

**Issue**: `useTierListsMetadata()` returns new object on every call, breaking all downstream memo
**File**: `src/features/tier-list/store/tier-store.ts` (lines 708-721)
**Fix**: Return raw array or use proper shallow comparison

```tsx
// Option 1: Return raw tierLists, compute metadata in component
export const useTierLists = () => useTierStore((state) => state.tierLists);

// Option 2: Use useShallow from zustand
import { useShallow } from 'zustand/shallow';
export const useTierListsMetadata = () =>
  useTierStore(useShallow((state) => state.tierLists.map(...)));
```

### P1 - Memoize Gallery Filter/Sort

**File**: `src/features/tier-list/components/TierListGallery.tsx` (lines 44-63)
**Issue**: Creates new array reference on every render
**Fix**: Wrap in `useMemo`

```tsx
const filteredAndSortedLists = useMemo(() => {
  const lowerQuery = searchQuery.toLowerCase();
  return tierLists
    .filter(list => list.title.toLowerCase().includes(lowerQuery))
    .sort((a, b) => ...);
}, [tierLists, searchQuery, sortBy]);
```

### P2 - Add Missing React.memo

| Component | File |
|-----------|------|
| `TierListCard` | `src/features/tier-list/components/TierListCard.tsx` |
| `ItemPool` | `src/features/tier-list/components/ItemPool.tsx` |

### P3 - Memoize Expensive Computations

**TierListCard.tsx** - `previewImages` chain (line 59):
```tsx
const previewImages = useMemo(() =>
  tierList.rows.flatMap(r => r.items)
    .concat(tierList.unassignedItems)
    .filter(item => item.imageUrl)
    .slice(0, 4),
  [tierList]
);
```

**ImageUpload.tsx** - Create Set for O(1) duplicate detection:
```tsx
const existingImageHashes = useMemo(() => {
  const set = new Set<string>();
  allItems.forEach(item => {
    if (item.imageUrl) set.add(item.imageUrl.split(',')[1] || '');
  });
  return set;
}, [allItems]);
```

### P4 - Extract Inline Callbacks

**TierListEditor.tsx** - Add Tier button (lines 491-504):
```tsx
const handleAddTier = useCallback(() => {
  const existingNames = currentList.rows.map(r => r.name);
  const nextIndex = currentList.rows.length % TIER_DEFAULTS.length;
  // ... rest of logic
}, [currentList.rows, addCustomTier]);
```

---

## 3. REFACTORING OPPORTUNITIES

### Extract Utilities

**`src/features/tier-list/utils/validation.ts`** (new file):
```tsx
export const isValidHexColor = (hex: string): boolean =>
  /^#[0-9A-Fa-f]{6}$/.test(hex);

export const validateTierName = (name: string): boolean =>
  name.trim().length > 0 && name.length <= 100;
```

**`src/features/tier-list/utils/dateHydration.ts`** (new file):
```tsx
export const reviveItem = (item: TierItem): TierItem => ({
  ...item,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
});

export const reviveTierList = (list: TierList): TierList => ({
  ...list,
  createdAt: new Date(list.createdAt),
  updatedAt: new Date(list.updatedAt),
  unassignedItems: list.unassignedItems.map(reviveItem),
  rows: list.rows.map(row => ({
    ...row,
    items: row.items.map(reviveItem),
  })),
});
```

### Optional: Split Large Components

**TierListEditor.tsx (580 lines)** could be split into:
- `<TierListHeader>` - Title editing, stats, color strip
- `<TierListToolbar>` - Undo/redo, export, more options

**TierRow.tsx (372 lines)** could extract:
- `<TierRowColorSettings>` - Color picker popover

---

## 4. FILES TO MODIFY

### Phase 1: Dead Code (5 mins)
- [ ] Delete `src/components/ui/ColorBadge.tsx`
- [ ] Delete `src/components/ui/CartCounter.tsx`
- [ ] Clean `src/features/tier-list/constants.ts`
- [ ] Clean `src/features/tier-list/index.ts`

### Phase 2: Critical Performance (30 mins)
- [ ] Fix `tier-store.ts` - useTierListsMetadata selector
- [ ] Fix `TierListGallery.tsx` - useMemo for filter/sort
- [ ] Add memo to `TierListCard.tsx`
- [ ] Add memo to `ItemPool.tsx`

### Phase 3: Performance Optimizations (20 mins)
- [ ] `TierListCard.tsx` - useMemo previewImages
- [ ] `TierListEditor.tsx` - useCallback for Add Tier
- [ ] `ImageUpload.tsx` - Set for duplicate detection

### Phase 4: Refactoring (Optional, 30 mins)
- [ ] Create `utils/validation.ts`
- [ ] Create `utils/dateHydration.ts`
- [ ] Apply utilities in tier-store.ts

---

## 5. TESTING CHECKLIST

- [ ] Gallery loads without lag
- [ ] Search filtering is responsive
- [ ] Card hover doesn't trigger full re-renders
- [ ] Drag and drop still works smoothly
- [ ] Undo/redo works correctly
- [ ] Build passes
- [ ] Lint passes
