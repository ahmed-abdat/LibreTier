# Feature: JSON Import/Export

## Status: Validated - Technically Feasible

## Overview

Allow users to export tier lists as JSON files and import them on other devices. This is a differentiator - no competitor offers this!

## Technical Feasibility: HIGH

### Why It's Feasible

1. **Data is JSON-serializable** - TierList structure is mostly primitives
2. **Date handling exists** - tier-store.ts already revives dates from ISO strings
3. **Base64 images work** - Already stored as data URIs in state
4. **No backend needed** - Pure client-side file operations

### Data Structure

```typescript
interface TierList {
  id: string; // UUID
  title: string; // max 100 chars
  rows: TierRow[]; // tier rows with items
  unassignedItems: TierItem[]; // items not in tiers
  createdAt: Date; // ISO string in JSON
  updatedAt: Date; // ISO string in JSON
}

interface TierItem {
  id: string;
  name: string;
  imageUrl?: string; // base64 data URI (large!)
  createdAt: Date;
  updatedAt: Date;
}
```

## Requirements

### Functional

- [ ] Export button downloads `.json` file
- [ ] Import via file picker or drag-drop
- [ ] Validate imported JSON structure
- [ ] Handle UUID conflicts (regenerate by default)
- [ ] Show success/error toasts

### Export Options

- [ ] Full export (with images) - larger files
- [ ] Compact export (no images) - smaller files
- [ ] File size warning if > 1MB

### Import Validation

- [ ] Valid JSON syntax
- [ ] Required fields: id, title, rows, unassignedItems
- [ ] Valid tier levels (S, A, B, C, D, F)
- [ ] Valid hex colors (#RRGGBB)
- [ ] Valid date strings

## Files to Modify

```
src/features/tier-list/store/tier-store.ts      # Add exportList, importList actions
src/features/tier-list/components/TierListEditor.tsx  # Add import/export buttons
src/features/tier-list/components/TierListGallery.tsx # Add import button
```

## Dependencies

None required. Optional:

- `zod` for schema validation (already removed, could re-add)

## Estimated Effort: 2-3 days

## Implementation Steps

### Phase 1: Export (1 day)

1. Add `exportList(listId, includeImages)` action to store
2. Convert dates to ISO strings
3. Create downloadable JSON blob
4. Add export button to editor header

### Phase 2: Import (1-2 days)

1. Add `importList(json)` action to store
2. Validate JSON structure
3. Regenerate UUIDs to avoid conflicts
4. Revive dates from ISO strings
5. Add import UI (file picker or dropzone)

## Size Considerations

| Items | With Images | Without Images |
| ----- | ----------- | -------------- |
| 10    | ~130KB      | ~2KB           |
| 50    | ~650KB      | ~10KB          |
| 100   | ~1.3MB      | ~20KB          |

**Recommendation:** Default to compact export, offer full export with warning.

## Risks & Mitigations

| Risk                        | Mitigation                            |
| --------------------------- | ------------------------------------- |
| Large files with images     | Offer compact export option           |
| localStorage quota exceeded | Check quota before import, warn user  |
| UUID conflicts              | Regenerate all UUIDs on import        |
| Invalid/malicious JSON      | Strict validation with error messages |
| Schema changes in future    | Add version field to export format    |

## Validation Checklist

- [x] Data structure is JSON-compatible
- [x] Date serialization pattern exists in codebase
- [x] Base64 images are valid JSON strings
- [x] File download works in all browsers (Blob + URL.createObjectURL)
- [x] File input works for import
- [ ] No external dependencies required

## Export Format Example

```json
{
  "version": 1,
  "exportedAt": "2024-12-19T10:30:00.000Z",
  "tierList": {
    "id": "abc-123",
    "title": "My Tier List",
    "rows": [...],
    "unassignedItems": [...],
    "createdAt": "2024-12-18T09:00:00.000Z",
    "updatedAt": "2024-12-19T10:00:00.000Z"
  }
}
```
