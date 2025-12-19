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
- **Animations**: Framer Motion
- **Theming**: next-themes (dark/light mode)
- **Image Processing**: Client-side Base64 compression
- **Export**: html2canvas for PNG export
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E)

## Commands

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm test         # Run unit tests (watch mode)
pnpm test:run     # Run unit tests once
pnpm test:e2e     # Run E2E tests (Playwright)
pnpm test:e2e:ui  # Run E2E tests with UI
```

## Project Structure

```
├── e2e/                    # Playwright E2E tests
│   ├── navigation.spec.ts  # Navigation tests
│   ├── tier-list.spec.ts   # Tier list creation tests
│   ├── editor.spec.ts      # Editor interaction tests
│   ├── gallery.spec.ts     # Gallery management tests
│   └── persistence.spec.ts # localStorage persistence tests
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page with hero section
│   │   ├── editor/[id]/        # Dynamic tier list editor route
│   │   │   └── page.tsx        # Editor page component
│   │   ├── tiers/              # Tier lists gallery
│   │   │   └── page.tsx        # Gallery page component
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── globals.css         # Global styles
│   │   └── not-found.tsx       # 404 page
│   ├── features/               # Feature-based modules
│   │   └── tier-list/          # Tier list feature
│   │       ├── components/     # Feature components
│   │       │   ├── TierListEditor.tsx  # Main editor with DND context
│   │       │   ├── TierListGallery.tsx # Gallery of saved tier lists
│   │       │   ├── TierListCard.tsx    # Card for gallery display
│   │       │   ├── TierRow.tsx         # Tier row (droppable)
│   │       │   ├── TierItem.tsx        # Draggable item
│   │       │   ├── ItemPool.tsx        # Unassigned items pool
│   │       │   ├── ImageUpload.tsx     # Drag & drop image upload
│   │       │   ├── ExportButton.tsx    # Export to PNG
│   │       │   └── EmptyState.tsx      # Empty state component
│   │       ├── hooks/          # Custom hooks
│   │       │   └── useTierListDnd.ts   # DND logic extracted from editor
│   │       ├── store/          # Zustand store
│   │       │   ├── tier-store.ts
│   │       │   └── index.ts
│   │       ├── constants.ts    # Tier levels and colors
│   │       └── index.ts        # Public API and type exports
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── landing/            # Landing page components
│   │   │   └── HeroSection.tsx
│   │   ├── layout/             # Layout components (Header)
│   │   ├── providers/          # Context providers (theme)
│   │   └── theme-toggle.tsx    # Dark/light mode toggle
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, getContrastColor)
│   └── test/
│       └── setup.ts            # Vitest setup with testing-library
├── playwright.config.ts    # Playwright configuration
└── vitest.config.ts        # Vitest configuration
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
App Layout
├── Header (navigation, theme toggle)
└── Pages
    ├── Landing (/)
    │   └── HeroSection (framer-motion animations)
    ├── Gallery (/tiers)
    │   └── TierListGallery
    │       └── TierListCard[] (saved tier lists)
    └── Editor (/editor/[id])
        └── TierListEditor (DndContext)
            ├── TierRow[] (useDroppable)
            │   └── TierItem[] (useSortable)
            ├── ItemPool (useDroppable)
            │   └── TierItem[] (useSortable)
            ├── ImageUpload (react-dropzone)
            ├── ExportButton (html2canvas)
            └── EmptyState (when no items)
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
