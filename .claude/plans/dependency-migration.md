# Tier Maker - Dependency Migration Plan

## Overview

**Scope:** Moderate updates - Next.js 16, skip Tailwind 4, remove unused deps, consolidate Radix UI.
**Created:** 2025-12-07
**Status:** Ready for execution

---

## Phase 1: Remove Unused Dependencies

- [ ] Remove `zod` (not used in codebase)
- [ ] Remove `@hookform/resolvers` (not used)
- [ ] Remove `react-hook-form` (not used)
- [ ] Delete `src/components/ui/form.tsx` (optional - unused component)

```bash
pnpm remove zod @hookform/resolvers react-hook-form
```

---

## Phase 2: Update Next.js to v16

### 2.1 Update Core Packages

- [ ] Update `next` to latest
- [ ] Update `react` and `react-dom` to latest
- [ ] Update dev dependencies (`@types/react`, `@types/react-dom`, `eslint-config-next`, `@next/eslint-plugin-next`)

```bash
pnpm add next@latest react@latest react-dom@latest
pnpm add -D @types/react@latest @types/react-dom@latest @next/eslint-plugin-next@latest eslint-config-next@latest
```

### 2.2 Update Configuration

- [ ] Review `next.config.mjs` - check `experimental.staleTimes` compatibility
- [ ] Update `overrides` in `package.json` for React types

### Files to check:

- `next.config.mjs`
- `package.json`

---

## Phase 3: Consolidate Radix UI

### 3.1 Remove Individual Packages

- [ ] Remove all `@radix-ui/react-*` packages (20 packages)

```bash
pnpm remove @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-tooltip
```

### 3.2 Install Unified Package

- [ ] Install `radix-ui`

```bash
pnpm add radix-ui
```

### 3.3 Update Imports in UI Components

- [ ] `src/components/ui/accordion.tsx`
- [ ] `src/components/ui/alert-dialog.tsx`
- [ ] `src/components/ui/avatar.tsx`
- [ ] `src/components/ui/checkbox.tsx`
- [ ] `src/components/ui/dialog.tsx`
- [ ] `src/components/ui/dropdown-menu.tsx`
- [ ] `src/components/ui/label.tsx`
- [ ] `src/components/ui/navigation-menu.tsx`
- [ ] `src/components/ui/popover.tsx`
- [ ] `src/components/ui/progress.tsx`
- [ ] `src/components/ui/radio-group.tsx`
- [ ] `src/components/ui/scroll-area.tsx`
- [ ] `src/components/ui/select.tsx`
- [ ] `src/components/ui/separator.tsx`
- [ ] `src/components/ui/slider.tsx`
- [ ] `src/components/ui/tabs.tsx`
- [ ] `src/components/ui/toggle.tsx`
- [ ] `src/components/ui/tooltip.tsx`
- [ ] `src/components/ui/button.tsx` (uses Slot)

**Import pattern change:**

```typescript
// Before
import * as AccordionPrimitive from "@radix-ui/react-accordion";

// After
import { Accordion } from "radix-ui";
// Use: Accordion.Root, Accordion.Item, etc.
```

---

## Phase 4: Update Other Dependencies

### 4.1 Production Dependencies

- [ ] `lucide-react` (0.483.0 → 0.556.0)
- [ ] `zustand` (5.0.3 → 5.0.9)
- [ ] `framer-motion` (already latest)
- [ ] `sonner` (1.7.4 → 2.0.7) ⚠️ Check API changes
- [ ] `date-fns` (3.6.0 → 4.1.0)
- [ ] `uuid` (11.1.0 → 13.0.0)
- [ ] `react-dropzone` (already latest)
- [ ] `react-day-picker` (9.6.3 → 9.12.0)
- [ ] `embla-carousel-react` (8.5.2 → 8.6.0)
- [ ] `next-themes` (0.4.4 → 0.4.6)
- [ ] `sharp` (0.33.5 → 0.34.5)
- [ ] `tailwind-merge` (2.5.2 → 3.4.0) ⚠️ Major version
- [ ] `@supabase/ssr` (0.5.2 → 0.8.0)
- [ ] `@supabase/auth-helpers-nextjs` (0.10.0 → 0.15.0)

```bash
pnpm add lucide-react@latest zustand@latest sonner@latest date-fns@latest uuid@latest react-day-picker@latest embla-carousel-react@latest next-themes@latest sharp@latest tailwind-merge@latest @supabase/ssr@latest @supabase/auth-helpers-nextjs@latest
```

### 4.2 Dev Dependencies

- [ ] `@typescript-eslint/eslint-plugin` (6.21.0 → 8.48.1)
- [ ] `@typescript-eslint/parser` (6.21.0 → 8.48.1)
- [ ] `@types/uuid` (10.0.0 → latest)
- [ ] `@types/node` (20.x → 24.x)
- [ ] `supabase` (2.12.1 → latest)

```bash
pnpm add -D @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest @types/uuid@latest @types/node@latest supabase@latest
```

---

## Phase 5: Post-Update Fixes

### 5.1 Sonner v2 Changes

- [ ] Check `src/app/layout.tsx` - Toaster component props
- [ ] Review toast usage in:
  - `src/features/tier-list/components/ImageUpload.tsx`
  - `src/features/tier-list/components/ExportButton.tsx`
  - `src/features/tier-list/components/TierListEditor.tsx`
  - `src/features/tier-list/components/TierListGallery.tsx`

### 5.2 tailwind-merge v3 Changes

- [ ] Check `src/lib/utils.ts` - `cn()` function compatibility

---

## Phase 6: Verification

- [ ] Run `pnpm install`
- [ ] Run `pnpm lint` - fix any type errors
- [ ] Run `pnpm build` - ensure production build works
- [ ] Manual testing:
  - [ ] Drag and drop functionality
  - [ ] Image upload
  - [ ] Export to PNG
  - [ ] Tier list CRUD
  - [ ] localStorage persistence
  - [ ] Dark mode toggle
  - [ ] Toast notifications

---

## Rollback Strategy

If issues occur:

```bash
git checkout HEAD -- package.json pnpm-lock.yaml
pnpm install
```

---

## Not In Scope (Future)

- **Tailwind CSS 4** - Wait for stable shadcn/ui support
- **Zod 4** - Reinstall when form validation is needed
