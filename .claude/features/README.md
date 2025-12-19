# Tier Maker - Feature Ideas & Roadmap

> This folder contains all feature ideas, their validation status, and detailed specs.

## Feature Status Overview

| ID  | Feature                 | Priority | Feasibility         | Status  | Spec                                             |
| --- | ----------------------- | -------- | ------------------- | ------- | ------------------------------------------------ |
| F1  | Undo/Redo System        | HIGH     | ✅ Validated        | ✅ Done | [undo-redo.md](./undo-redo.md)                   |
| F2  | Keyboard Navigation     | HIGH     | ✅ Validated        | ✅ Done | [keyboard-nav.md](./keyboard-nav.md)             |
| F3  | Template System         | HIGH     | ✅ Validated        | Planned | [templates.md](./templates.md)                   |
| F4  | JSON Import/Export      | HIGH     | ✅ Validated        | Planned | [json-import-export.md](./json-import-export.md) |
| F5  | Image Crop/Resize       | LOW      | ⚠️ Needs validation | Backlog | -                                                |
| F6  | Color Presets           | LOW      | ✅ Easy             | Backlog | -                                                |
| F7  | Multiple Export Formats | LOW      | ✅ Easy             | Backlog | -                                                |
| F8  | Storybook Docs          | LOW      | ✅ Easy             | Backlog | -                                                |

---

## High Priority Features (Sprint 1-3)

### F1: Undo/Redo System ⭐

**Problem:** Users accidentally move items and can't undo
**Solution:** Add history tracking with Ctrl+Z / Ctrl+Shift+Z
**Effort:** 3-4 days
**Dependencies:** zundo library
**[Full Spec →](./undo-redo.md)**

### F2: Keyboard Navigation

**Problem:** Drag-and-drop is mouse-only, accessibility issue
**Solution:** Document existing KeyboardSensor, add help text
**Effort:** 1 day (sensor already exists!)
**[Full Spec →](./keyboard-nav.md)**

### F3: Template System

**Problem:** Users start from scratch every time
**Solution:** Pre-built templates for popular categories
**Effort:** 3-5 days
**Categories:** Games, Anime, Movies, Music, Food
**[Full Spec →](./templates.md)**

### F4: JSON Import/Export

**Problem:** Can't transfer tier lists between devices
**Solution:** Export as JSON file, import from file
**Effort:** 2-3 days
**Prerequisite:** Fix Date serialization (Phase 4.4)
**[Full Spec →](./json-import-export.md)**

---

## Medium Priority Features (Backlog)

### F5: Image Crop/Resize

**Problem:** Users upload images that don't fit well
**Solution:** Add crop/resize before adding to tier list
**Effort:** 3-4 days
**Library:** react-image-crop or similar
**Status:** Deprioritized - users can crop externally

### F6: Custom Tier Color Presets

**Problem:** Limited color customization
**Solution:** Add preset themes (pastel, dark, neon)
**Effort:** 1-2 days
**Status:** Already have color picker + 9 presets

### F7: Multiple Export Formats

**Problem:** Only PNG export available
**Solution:** Add JPEG, WebP options
**Effort:** 1-2 days
**Status:** PNG covers 90% of use cases

### F8: Storybook Documentation

**Problem:** Developers need component docs
**Solution:** Add Storybook for visual component testing
**Effort:** 2-3 days
**Status:** Developer-only, no user impact

---

## Future Ideas (Not Validated)

### URL Sharing (Deferred)

- Share tier lists via URL
- Options: Base64 encoding or backend storage
- Deferred until core features complete

### Real-time Collaboration (Not Planned)

- Edit tier lists together
- Requires backend (Supabase)
- User chose local-only architecture

### Mobile PWA

- Install as mobile app
- Add manifest.json, service worker
- Low effort, good for adoption

### Tier List Gallery

- Browse public tier lists
- Requires backend
- Phase 2 feature

### Text-only Items

- Add items without images
- Just text labels
- Quick addition option

### Duplicate Items

- Copy item to another tier
- Right-click → Duplicate

### Batch Delete

- Select multiple items
- Delete all at once

### Drag-to-reorder Tiers

- Reorder tiers by dragging
- Already implemented! ✅

---

## Competitor Features We Don't Have

| Feature          | TierMaker | Canva | Us  | Priority                    |
| ---------------- | --------- | ----- | --- | --------------------------- |
| 1M+ Templates    | ✅        | ✅    | ❌  | HIGH (F3)                   |
| Undo/Redo        | Limited   | ✅    | ❌  | HIGH (F1)                   |
| JSON Export      | ❌        | ❌    | ❌  | HIGH (F4) - Differentiator! |
| Real-time Collab | ❌        | ✅    | ❌  | Not planned                 |
| Ads              | ✅        | ❌    | ❌  | Never!                      |

---

## Our Competitive Advantages

Things we do better than competitors:

1. **100% Free** - No ads, no paywall, no limits
2. **Privacy-first** - All data stays local
3. **No login required** - Zero friction
4. **Open source** - Transparent, customizable
5. **Modern stack** - Fast, responsive, dark mode
6. **Batch upload** - Add multiple images at once

---

## Implementation Order

### Sprint 1: Core UX

1. F1: Undo/Redo
2. F2: Keyboard Nav Documentation

### Sprint 2: Data Portability

3. F4: JSON Import/Export
4. Fix Phase 4.4 (Date serialization)

### Sprint 3: Quick Start

5. F3: Templates (5 starter templates)

### Backlog

- F5-F8 as time permits
- Future ideas based on user feedback
