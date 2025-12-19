# Feature: Template System

## Status: Validated - Feasible

## Overview

Pre-built tier list templates for popular categories to help users get started quickly.

## Technical Feasibility: HIGH

### Why It's Feasible

1. **Simple data structure** - Templates are just pre-filled TierList objects
2. **No backend needed** - Templates stored as static JSON
3. **Existing create flow** - Just pre-populate instead of empty list
4. **No images needed** - Templates provide structure, users add their own images

## Requirements

### Functional

- [ ] Template picker on "Create New" flow
- [ ] 5 starter templates: Games, Anime, Movies, Music, Food
- [ ] Each template has pre-named tiers (customized per category)
- [ ] "Blank" option for starting from scratch
- [ ] Templates don't include items (just tier structure)

### Template Structure

```typescript
interface Template {
  id: string;
  name: string; // "Video Games", "Anime Characters"
  description: string; // "Rank your favorite games"
  category: string; // "games", "anime", "movies", "music", "food"
  icon: string; // Lucide icon name
  tiers: TemplateTier[]; // Custom tier names/colors
}

interface TemplateTier {
  name: string; // "God Tier", "Must Play", etc.
  color: string; // Hex color
}
```

### Starter Templates

| Template    | Tiers                                        | Description       |
| ----------- | -------------------------------------------- | ----------------- |
| Video Games | God Tier, Must Play, Great, Good, Meh, Skip  | Rank games        |
| Anime       | Masterpiece, Amazing, Great, Good, Mid, Drop | Rank anime        |
| Movies      | Cinema, Great, Good, Okay, Bad, Avoid        | Rank films        |
| Music       | Legendary, Fire, Solid, Decent, Skip, Trash  | Rank albums/songs |
| Food        | Elite, Delicious, Tasty, Fine, Meh, Gross    | Rank foods        |

## Files to Create/Modify

```
src/features/tier-list/templates/           # New folder
  index.ts                                  # Export templates
  games.ts                                  # Game template
  anime.ts                                  # Anime template
  movies.ts                                 # Movies template
  music.ts                                  # Music template
  food.ts                                   # Food template

src/features/tier-list/components/
  TemplatePickerModal.tsx                   # New component
  TierListGallery.tsx                       # Modify create flow
```

## Dependencies

None required.

## Estimated Effort: 3-5 days

## Implementation Steps

### Phase 1: Template Data (1 day)

1. Create template data structure
2. Define 5 starter templates with custom tier names
3. Export from templates/index.ts

### Phase 2: Template Picker UI (2-3 days)

1. Create TemplatePickerModal component
2. Grid of template cards with icons
3. Preview of tier structure on hover/click
4. "Use Template" and "Start Blank" buttons
5. Integrate with createList action

### Phase 3: Polish (1 day)

1. Add category icons (Lucide)
2. Add template previews
3. Responsive design for mobile

## UI Mockup

```
┌─────────────────────────────────────────┐
│  Choose a Template                    ✕ │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │ 🎮    │  │ 🎬    │  │ 🎵    │       │
│  │ Games │  │ Movies│  │ Music │       │
│  └───────┘  └───────┘  └───────┘       │
│                                         │
│  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │ 📺    │  │ 🍔    │  │ ➕    │       │
│  │ Anime │  │ Food  │  │ Blank │       │
│  └───────┘  └───────┘  └───────┘       │
│                                         │
└─────────────────────────────────────────┘
```

## Risks & Mitigations

| Risk             | Mitigation                               |
| ---------------- | ---------------------------------------- |
| Template bloat   | Start with 5, add based on user feedback |
| Naming conflicts | Use unique IDs, allow renaming           |
| Localization     | English only for MVP                     |

## Validation Checklist

- [x] No external dependencies needed
- [x] Simple data structure
- [x] Existing createList can accept initial data
- [x] Lucide icons already available
- [ ] Modal component pattern exists (AlertDialog)

## Future Ideas

- User-created templates (save current as template)
- Community templates (requires backend)
- Template categories/search
- Template thumbnails
