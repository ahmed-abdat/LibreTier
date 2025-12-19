# Feature: Undo/Redo System

## Status: Validated - Technically Feasible

## Overview

Add undo/redo functionality to allow users to revert accidental changes.

## Technical Feasibility: HIGH

### Why It's Feasible

1. **Zustand supports middleware** - Already using persist middleware, can add temporal/history middleware
2. **State is serializable** - TierList data structure is JSON-compatible
3. **DND Kit is stateless** - Drag operations end with state updates, easy to track

### Implementation Options

#### Option A: zundo (Zustand Undo Middleware) - RECOMMENDED

```bash
pnpm add zundo
```

**Pros:**

- Maintained library specifically for Zustand
- Simple integration with existing store
- Handles temporal state automatically

**Cons:**

- External dependency
- May need configuration for selective tracking

#### Option B: Custom History Stack

Build own history management with:

- `past: TierList[]` - Previous states
- `future: TierList[]` - States after undo

**Pros:**

- No dependencies
- Full control

**Cons:**

- More code to maintain
- Must handle edge cases

## Requirements

### Functional

- [ ] Undo last action (Ctrl+Z / Cmd+Z)
- [ ] Redo last undone action (Ctrl+Shift+Z / Cmd+Shift+Z)
- [ ] Visual undo/redo buttons in toolbar
- [ ] Disable buttons when no history available
- [ ] Max history depth (50 steps to limit memory)

### Technical

- [ ] Track these actions: moveItem, addItem, deleteItem, updateTier, deleteTier, clearAllItems
- [ ] Don't track: dragState changes (transient)
- [ ] Handle localStorage sync with history

## Files to Modify

```
src/features/tier-list/store/tier-store.ts  # Add undo middleware
src/features/tier-list/components/TierListEditor.tsx  # Add undo/redo buttons
```

## Dependencies

```json
{
  "zundo": "^2.0.0"
}
```

## Estimated Effort: 3-4 days

## Risks & Mitigations

| Risk                            | Mitigation                                        |
| ------------------------------- | ------------------------------------------------- |
| Memory usage with large history | Limit to 50 steps, compress if needed             |
| Undo during drag operation      | Disable undo while isDragging                     |
| Image data in history           | Images are base64 in state, may need optimization |

## Validation Checklist

- [x] Library exists and is maintained (zundo v2.3.0, actively maintained)
- [x] Works with Zustand v5 (project uses 5.0.9) - officially supported
- [x] Listed in Zustand's official third-party libraries
- [x] Bundle size: <700 bytes (minimal impact)
- [x] No breaking changes to existing store pattern
- [x] Keyboard shortcuts don't conflict with browser defaults

## Sources

- [zundo GitHub](https://github.com/charkour/zundo)
- [zundo npm](https://www.npmjs.com/package/zundo)
- [Zustand Third-party Libraries](https://zustand.docs.pmnd.rs/integrations/third-party-libraries)
