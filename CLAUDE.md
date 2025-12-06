# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

Tier Maker is a modern web application for creating and sharing tier-based rankings with drag-and-drop functionality. Users can upload images, organize them into customizable tiers (S, A, B, C, D, F), and export their tier lists as images.

**Current Status**: MVP - Fully functional client-side tier maker with no backend required.

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with persist middleware (localStorage)
- **Drag and Drop**: DND Kit (@dnd-kit/core, @dnd-kit/sortable)
- **Image Processing**: Client-side Base64 compression
- **Export**: html2canvas for PNG export
- **Form Handling**: React Hook Form with Zod validation

## Commands

```bash
pnpm dev      # Start development server with Turbopack
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   └── page.tsx           # Main tier list editor page
├── features/               # Feature-based modules
│   └── tier-list/          # Tier list feature
│       ├── components/     # Feature components
│       │   ├── TierListEditor.tsx  # Main editor with DND context
│       │   ├── TierRow.tsx         # Tier row (droppable)
│       │   ├── TierItem.tsx        # Draggable item
│       │   ├── ItemPool.tsx        # Unassigned items pool
│       │   ├── ImageUpload.tsx     # Drag & drop image upload
│       │   └── ExportButton.tsx    # Export to PNG
│       ├── store/          # Zustand store
│       │   └── tier-store.ts
│       ├── constants.ts    # Tier levels and colors
│       └── index.ts        # Public API and type exports
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components
│   └── providers/          # Context providers
└── lib/
    └── utils.ts            # Utility functions (cn helper)
```

## Architecture

### Data Flow
```
Images → Base64 compression → Zustand store → localStorage
Drag & Drop → DND Kit → moveItem action → State update
Export → html2canvas → PNG download
```

### Key Store Actions
- `createList(title)`: Initialize new tier list
- `addItem(item)`: Add item to unassigned pool
- `moveItem(itemId, source, target)`: Move between tiers/pool
- `updateTier(id, updates)`: Customize tier name/color
- `clearAllItems()`: Reset all items

### Key Types
- `TierItem`: { id, name, imageUrl?, description?, createdAt, updatedAt }
- `TierRow`: { id, level, color, items[], name? }
- `TierList`: { id, title, rows[], unassignedItems[], ... }
- `TierLevel`: "S" | "A" | "B" | "C" | "D" | "F"

## Component Hierarchy

```
TierListEditor (DndContext)
├── TierRow[] (useDroppable)
│   └── TierItem[] (useSortable)
├── ItemPool (useDroppable)
│   └── TierItem[] (useSortable)
├── ImageUpload (react-dropzone)
└── ExportButton (html2canvas)
```

## Future Enhancements (Phase 2)

When backend is needed:
1. Supabase Auth for user accounts
2. Cloudflare R2 for image storage (zero egress fees)
3. Share tier lists via URL
4. User profiles and saved lists

## ESLint Configuration

TypeScript ESLint with warnings (not errors) for:
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unused-vars`
- `@typescript-eslint/no-empty-interface`
