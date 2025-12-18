# Tier Maker - Open Source Readiness Plan

> **Status**: In Progress
> **Created**: 2024-12-18
> **Last Updated**: 2024-12-18

---

## Overview

This plan tracks the work needed to prepare Tier Maker for open-source release. The codebase has a solid foundation (8.5/10 code quality) but needs testing, documentation, and cleanup before public release.

---

## Progress Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Quick Wins | Not Started | 0/5 |
| Phase 2: Testing Infrastructure | Not Started | 0/6 |
| Phase 3: Code Quality | Not Started | 0/6 |
| Phase 4: Refactoring | Not Started | 0/5 |
| Phase 5: CI/CD & Automation | Not Started | 0/4 |
| Future Features | Backlog | 0/8 |

---

## Phase 1: Quick Wins (1-2 days)

> **Status**: Not Started
> **Priority**: Critical
> **Estimated Time**: 4-6 hours

These are low-effort, high-impact changes that should be done first.

### Tasks

- [ ] **1.1 Fix package.json metadata**
  - Change name from "unem-dashboard" to "tier-maker"
  - Add proper description
  - Add repository URL
  - Add keywords for discoverability

- [ ] **1.2 Remove unused dependencies**
  - Remove `@emailjs/browser` (not used)
  - Remove `sharp` (client-side only, not needed)
  - Remove `react-icons` (duplicate of lucide-react)
  - Remove direct `radix-ui` dependency (shadcn/ui provides it)
  - Remove `@supabase/ssr` (Phase 2 feature not implemented)

- [ ] **1.3 Create CONTRIBUTING.md**
  - Setup instructions
  - Development workflow
  - PR process
  - Code style guidelines
  - Commit message conventions

- [ ] **1.4 Create CHANGELOG.md**
  - Document v1.0.0 features
  - Follow Keep a Changelog format
  - Include all current functionality

- [ ] **1.5 Create CODE_OF_CONDUCT.md**
  - Add Contributor Covenant
  - Define community guidelines

---

## Phase 2: Testing Infrastructure (1 week)

> **Status**: Not Started
> **Priority**: Critical
> **Estimated Time**: 15-20 hours

### Testing Library Decision

After research, **Vitest + React Testing Library** is recommended:

| Factor | Vitest | Jest |
|--------|--------|------|
| Next.js 15 Support | Native | Requires config |
| Performance | 30-70% faster | Baseline |
| TypeScript | Built-in | Needs ts-jest |
| React 19 | Optimized | Works but slower |
| Memory | 30% lower | Higher |

**E2E Testing**: Playwright (for drag-and-drop flows)

### Tasks

- [ ] **2.1 Install Vitest + React Testing Library**
  ```bash
  pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths @vitest/coverage-v8
  ```

- [ ] **2.2 Configure Vitest**
  - Create `vitest.config.ts`
  - Create `src/test/setup.ts`
  - Add test scripts to package.json

- [ ] **2.3 Write Store Tests (Priority)**
  - Test `createList` action
  - Test `addItem` action
  - Test `moveItem` action
  - Test `deleteList` action
  - Test `updateTier` action
  - Test localStorage persistence

- [ ] **2.4 Write Component Tests**
  - Test TierRow rendering
  - Test TierItem interactions
  - Test ImageUpload file handling
  - Test EmptyState conditions

- [ ] **2.5 Install Playwright for E2E**
  ```bash
  pnpm add -D @playwright/test
  pnpm exec playwright install
  ```

- [ ] **2.6 Write E2E Tests**
  - Test complete tier list creation flow
  - Test drag-and-drop between tiers
  - Test export to PNG
  - Test localStorage persistence

---

## Phase 3: Code Quality (3-4 days)

> **Status**: Not Started
> **Priority**: High
> **Estimated Time**: 8-10 hours

### Tasks

- [ ] **3.1 Add Prettier**
  - Install prettier
  - Create `.prettierrc.json`
  - Create `.prettierignore`
  - Add format scripts

- [ ] **3.2 Add Husky + lint-staged**
  - Install husky and lint-staged
  - Configure pre-commit hooks
  - Run lint and format on staged files

- [ ] **3.3 Create .editorconfig**
  - Define indent style
  - Define charset
  - Ensure IDE consistency

- [ ] **3.4 Fix Accessibility Issues**
  - Add ARIA labels to loading spinners
  - Improve keyboard navigation in ImageUpload
  - Fix disabled button state for screen readers
  - Add proper alt text to decorative images

- [ ] **3.5 Add Input Validation to Store**
  - Validate `updateTier` name (non-empty)
  - Validate `updateList` title (non-empty)
  - Validate tier colors (valid hex)

- [ ] **3.6 Add File Size Validation**
  - Add max file size check in ImageUpload (10MB)
  - Show user-friendly error for large files

---

## Phase 4: Refactoring (1 week)

> **Status**: Not Started
> **Priority**: Medium
> **Estimated Time**: 10-15 hours

### Tasks

- [ ] **4.1 Extract DND Handlers to Custom Hook**
  - Create `src/features/tier-list/hooks/useTierListDragHandlers.ts`
  - Move `handleDragStart`, `handleDragOver`, `handleDragEnd` from TierListEditor
  - Reduce TierListEditor.tsx from 503 to ~300 lines

- [ ] **4.2 Move Utility Functions to lib/**
  - Move `getContrastColor` from TierRow.tsx to `lib/utils.ts`
  - Export for reuse in other components

- [ ] **4.3 Create Consistent Error Handling**
  - Create `src/lib/error-handler.ts`
  - Unified pattern: console.error + toast
  - Replace inconsistent error handling across components

- [ ] **4.4 Fix Date Serialization in Store**
  - Add custom serialize/deserialize to Zustand persist
  - Properly handle Date objects in localStorage

- [ ] **4.5 Restrict Remote Image Patterns**
  - Update `next.config.mjs` to only allow specific domains
  - Remove wildcard `hostname: "**"` pattern

---

## Phase 5: CI/CD & Automation (2-3 days)

> **Status**: Not Started
> **Priority**: High
> **Estimated Time**: 4-6 hours

### Tasks

- [ ] **5.1 Create GitHub Actions CI Workflow**
  - Run lint on every PR
  - Run type-check on every PR
  - Run tests on every PR
  - Run build on every PR

- [ ] **5.2 Create GitHub Issue Templates**
  - Bug report template
  - Feature request template
  - Question template

- [ ] **5.3 Create GitHub PR Template**
  - Description section
  - Type of change
  - Testing checklist
  - Screenshots section

- [ ] **5.4 Add Dependabot Configuration**
  - Auto-update dependencies
  - Security alerts

---

## Future Features (Backlog)

> **Status**: Backlog
> **Priority**: Low (Post-Release)

These are feature suggestions to implement after the open-source release.

### High Value Features

- [ ] **F1: Undo/Redo System**
  - Common user request for tier makers
  - Implement with Zustand middleware or custom history stack
  - Keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z

- [ ] **F2: Keyboard Accessibility for Drag-and-Drop**
  - Full keyboard navigation using DND Kit's keyboard sensor
  - Arrow keys to move items between tiers
  - Improves accessibility score

- [ ] **F3: Template System**
  - Pre-built tier list templates (anime, games, movies)
  - Quick start for users
  - Community-contributed templates

- [ ] **F4: JSON Import/Export**
  - Export tier list as JSON file
  - Import JSON to restore tier list
  - Enables sharing without images

### Medium Value Features

- [ ] **F5: Image Crop/Resize**
  - Crop images before adding to tier list
  - Resize for consistent appearance
  - Use react-image-crop or similar

- [ ] **F6: Custom Tier Colors with Presets**
  - Color presets (pastel, dark, neon)
  - Custom gradient backgrounds
  - More visual customization

- [ ] **F7: Multiple Export Formats**
  - PNG (current)
  - JPEG with quality selection
  - WebP for smaller file sizes
  - PDF for printing

- [ ] **F8: Storybook Component Documentation**
  - Interactive component library
  - Visual testing
  - Developer documentation

---

## Technical Debt Tracker

Issues to address during refactoring:

| Issue | File | Line | Severity |
|-------|------|------|----------|
| Template literal in className | ExportButton.tsx | 111 | Low |
| Long component (503 lines) | TierListEditor.tsx | - | Medium |
| No file size validation | ImageUpload.tsx | 72-115 | Medium |
| No input validation | tier-store.ts | Various | Medium |
| getContrastColor not exported | TierRow.tsx | 113-121 | Low |
| Wildcard remote patterns | next.config.mjs | - | Medium |
| Missing ARIA labels | Multiple | - | Medium |

---

## Notes

### Testing Strategy

For the tier store (~560 lines):

```
Unit Tests (75-80%):
- Store actions: createList, addItem, moveItem, etc.
- Pure functions: validation, formatting
- Custom hooks

Component Tests (15-20%):
- TierRow rendering
- TierItem interactions
- ImageUpload functionality
- EmptyState conditions

E2E Tests (5-10%):
- Complete tier list creation flow
- Drag-and-drop between tiers (Playwright)
- Export to PNG
- LocalStorage persistence
```

### DND Kit Testing Note

DND Kit doesn't use HTML5 Drag-and-Drop API, making traditional RTL drag events ineffective. Strategy:

1. **Unit tests**: Test store actions directly (bypass DND Kit)
2. **E2E tests**: Use Playwright for actual drag-and-drop interactions
3. **Keyboard tests**: Test DND Kit's keyboard sensor

---

## Completion Criteria

A phase is considered complete when:

1. All tasks in the phase are checked off
2. Code has been committed with descriptive messages
3. No regressions introduced (tests pass)
4. Documentation updated if needed

---

## Session Log

Track progress across sessions:

| Date | Session | Work Done |
|------|---------|-----------|
| 2024-12-18 | 1 | Created plan, researched testing libraries |
| | | |
| | | |

